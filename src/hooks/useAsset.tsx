import type { Asset } from 'asset/Asset'
import { useServices } from 'hooks/useServices'
import {
	createContext,
	FunctionComponent,
	useContext,
	useEffect,
	useState,
} from 'react'

export const AssetContext = createContext<{
	asset?: Asset
	setAssetId: (assetId?: string) => void
	setUpdateInterval: (interval: number) => void
	deleteAsset: () => void
}>({
	setAssetId: () => undefined,
	setUpdateInterval: () => undefined,
	deleteAsset: () => undefined,
})

export const useAsset = () => useContext(AssetContext)

export const AssetProvider: FunctionComponent = ({ children }) => {
	const { iot } = useServices()
	const [assetId, setAssetId] = useState<string>()
	const [currentAsset, setCurrentAsset] = useState<Asset>()
	const [updateInterval, setUpdateInterval] = useState<number>(5000)

	// Load current device
	useEffect(() => {
		let isMounted = true
		if (assetId === undefined) return
		if (currentAsset !== undefined) return // Already loaded

		iot
			.getThing(assetId)
			.then((asset) => {
				if (!isMounted) return
				setCurrentAsset(asset)
			})
			.catch((err) => console.error(`[AssetContext]`, err))

		return () => {
			isMounted = false
		}
	}, [iot, assetId, currentAsset])

	// Auto-update the current device state
	useEffect(() => {
		let isMounted = true
		if (currentAsset === undefined) return
		if (updateInterval < 1000) return

		const updateState = async () => {
			if (currentAsset === undefined) return
			iot
				.getThing(currentAsset.id)
				.then((asset) => {
					if (!isMounted) return
					setCurrentAsset(asset)
				})
				.catch((err) => console.error(`[AssetContext]`, err))
		}

		console.debug(`[autoUpdateDeviceState]`, 'enabled', updateInterval)
		const interval = setInterval(updateState, updateInterval)
		return () => {
			console.debug(`[autoUpdateDeviceState]`, 'disabled')
			clearInterval(interval)
			isMounted = false
		}
	}, [currentAsset, updateInterval, iot])

	// Unload device data if deviceId is changed
	useEffect(() => {
		if (assetId === undefined) {
			setCurrentAsset(undefined)
		}
	}, [assetId])

	return (
		<AssetContext.Provider
			value={{
				setAssetId: setAssetId,
				setUpdateInterval,
				asset: currentAsset,
				deleteAsset: () => {
					if (currentAsset === undefined) return
					iot
						.deleteThing(currentAsset.id)
						.catch((err) => console.error(`[useAsset:deleteAsset]`, err))
				},
			}}
		>
			{children}
		</AssetContext.Provider>
	)
}
