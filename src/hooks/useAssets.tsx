import type { Asset } from 'asset/asset'
import { useServices } from 'hooks/useServices'
import {
	createContext,
	FunctionComponent,
	useCallback,
	useContext,
	useState,
} from 'react'

export const AssetsContext = createContext<{
	assets?: Asset[]
	next?: () => void
	reload: () => void
}>({
	reload: () => undefined,
})

export const useAssets = () => useContext(AssetsContext)

export const AssetsProvider: FunctionComponent = ({ children }) => {
	const { iot } = useServices()
	const [assets, setAssets] = useState<Asset[]>()
	const [nextStartKey, setNextStartKey] = useState<string>()
	const [fetching, setFetching] = useState<boolean>(false)
	const [fetchedStartKeys, setFetchedStartKeys] = useState<
		(undefined | string)[]
	>([])

	const fetchPage = useCallback(() => {
		if (fetchedStartKeys.includes(nextStartKey)) return
		setFetching(true)
		// Remember which pages we have already fetched
		setFetchedStartKeys((fetchedStartKeys) => [
			...fetchedStartKeys,
			nextStartKey,
		])
		iot
			.listThings({ startKey: nextStartKey })
			.then(({ things, nextStartKey }) => {
				setAssets((current) => [
					...(current ?? []),
					...things.map((thing) => ({
						id: thing.thingName as string,
						name: (thing.attributes?.name ?? thing.thingName) as string,
						version: thing.version ?? -1,
					})),
				])
				setNextStartKey(nextStartKey)
			})
			.catch(console.error)
			.finally(() => {
				setFetching(false)
			})
	}, [nextStartKey, iot, fetchedStartKeys])

	const hasNextPage = nextStartKey !== undefined
	const hasNotYetFetched = fetchedStartKeys.length === 0

	return (
		<AssetsContext.Provider
			value={{
				assets: assets,
				next:
					(hasNotYetFetched || hasNextPage) && !fetching
						? () => {
								fetchPage()
						  }
						: undefined,
				reload: () => {
					setFetchedStartKeys([])
					setNextStartKey(undefined)
					setAssets([])
				},
			}}
		>
			{children}
		</AssetsContext.Provider>
	)
}
