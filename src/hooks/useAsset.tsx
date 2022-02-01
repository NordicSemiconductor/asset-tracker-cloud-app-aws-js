import type { Asset, AssetTwin, AssetWithTwin } from 'asset/asset'
import equal from 'fast-deep-equal'
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
	twin?: AssetTwin
	setAssetId: (assetId?: string) => void
	setUpdateInterval: (interval: number) => void
	deleteAsset: () => Promise<void>
}>({
	setAssetId: () => undefined,
	setUpdateInterval: () => undefined,
	deleteAsset: async () => Promise.resolve(undefined),
})

export const useAsset = () => useContext(AssetContext)

export const AssetProvider: FunctionComponent = ({ children }) => {
	const { iot } = useServices()
	const [assetId, setAssetId] = useState<string>()
	const [currentAsset, setCurrentAsset] = useState<AssetWithTwin>()
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
			if (currentAsset?.asset === undefined) return
			iot
				.getThing(currentAsset.asset.id)
				.then((updatedAsset) => {
					if (!isMounted) return
					if (equal(updatedAsset, currentAsset)) return
					console.debug(`[autoUpdateDeviceState]`, 'update')
					setCurrentAsset(updatedAsset)
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
				asset: currentAsset?.asset,
				twin: currentAsset?.twin,
				deleteAsset: async () => {
					if (currentAsset?.asset === undefined) return
					return iot
						.deleteThing(currentAsset.asset.id)
						.then(() => {
							setAssetId(undefined)
						})
						.catch((err) => console.error(`[useAsset:deleteAsset]`, err))
				},
			}}
		>
			{children}
		</AssetContext.Provider>
	)
}
