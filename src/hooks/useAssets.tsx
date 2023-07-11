import type { Asset } from 'asset/asset'
import { useServices } from 'hooks/useServices'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
	type FunctionComponent,
	type ReactNode,
} from 'react'

export const AssetsContext = createContext<{
	assets?: Asset[]
	next?: () => void
	reload: () => void
}>({
	reload: () => undefined,
})

export const useAssets = () => useContext(AssetsContext)

export const AssetsProvider: FunctionComponent<{ children: ReactNode }> = ({
	children,
}) => {
	const { iot } = useServices()
	const [assets, setAssets] = useState<Asset[]>()
	const [fetching, setFetching] = useState<boolean>(false)

	const [pageState, setPageState] = useState<{
		currentPage: number
		nextStartKey?: string
		fetchedStartKeys: string[]
		fetchedPages: Record<number, boolean>
	}>({
		currentPage: 0,
		fetchedStartKeys: [],
		fetchedPages: {},
	})

	const { fetchedStartKeys, nextStartKey, fetchedPages, currentPage } =
		pageState

	const fetchPage = useCallback(() => {
		if (fetchedPages[currentPage] !== undefined) return
		if (fetchedStartKeys.includes(nextStartKey ?? '')) return
		setFetching(true)
		// Remember which pages we have already fetched
		setPageState((state) => ({
			...state,
			fetchedPages: {
				...fetchedPages,
				[currentPage]: true,
			},
			fetchedStartKeys: [...fetchedStartKeys, nextStartKey ?? ''],
		}))
		iot
			.listThings({ startKey: nextStartKey })
			.then(({ things, nextStartKey }) => {
				setAssets((current) => [...(current ?? []), ...things])
				setPageState((state) => ({
					...state,
					nextStartKey,
				}))
			})
			.catch(console.error)
			.finally(() => {
				setFetching(false)
			})
	}, [nextStartKey, iot, fetchedStartKeys, fetchedPages, currentPage])

	// Always load first page
	useEffect(() => {
		fetchPage()
	}, [fetchPage])

	const hasNextPage = nextStartKey !== undefined
	const hasNotYetFetched = fetchedStartKeys.length === 0

	return (
		<AssetsContext.Provider
			value={{
				assets,
				next:
					(hasNotYetFetched || hasNextPage) && !fetching
						? () => {
								setPageState((state) => ({
									...state,
									currentPage: state.currentPage + 1,
								}))
						  }
						: undefined,
				reload: () => {
					setAssets([])
					setPageState((state) => ({
						...state,
						currentPage: 0,
						fetchedPages: {},
						fetchedStartKeys: [],
						nextStartKey: '',
					}))
				},
			}}
		>
			{children}
		</AssetsContext.Provider>
	)
}
