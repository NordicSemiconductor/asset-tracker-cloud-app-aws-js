import { type ConfigData } from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'
import type { Asset, AssetTwin, AssetWithTwin } from 'asset/asset'
import { defaultConfig } from 'asset/config'
import equal from 'fast-deep-equal'
import { useAppConfig } from 'hooks/useAppConfig'
import { useServices } from 'hooks/useServices'
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type FunctionComponent,
	type ReactNode,
} from 'react'

export const AssetContext = createContext<{
	asset?: Asset
	twin?: AssetTwin
	setAssetId: (assetId?: string) => void
	deleteAsset: () => Promise<void>
	update: (patch: { name?: string; cfg?: ConfigData }) => Promise<void>
	error?: Error
}>({
	setAssetId: () => undefined,
	deleteAsset: async () => Promise.resolve(undefined),
	update: async () =>
		Promise.reject(new Error('[useAsset] update not possible.')),
})

export const useAsset = () => useContext(AssetContext)

export const AssetProvider: FunctionComponent<{ children: ReactNode }> = ({
	children,
}) => {
	const { iot } = useServices()
	const [assetId, setAssetId] = useState<string>()
	const [currentAsset, setCurrentAsset] = useState<AssetWithTwin>()
	const { autoUpdateIntervalInSeconds } = useAppConfig()
	const [error, setError] = useState<Error>()

	// Load current device
	useEffect(() => {
		let isMounted = true
		if (assetId === undefined) return
		if (currentAsset !== undefined) return // Already loaded

		setError(undefined)

		iot
			.getThing(assetId)
			.then((asset) => {
				if (!isMounted) return
				setCurrentAsset(asset)
			})
			.catch((err) => {
				console.error(`[useAsset]`, err)
				setError(err)
			})

		return () => {
			isMounted = false
		}
	}, [iot, assetId, currentAsset])

	// Auto-update the current device state
	useEffect(() => {
		let isMounted = true
		if (currentAsset === undefined) return

		const updateState = async () => {
			if (currentAsset?.asset === undefined) return
			iot
				.getThing(currentAsset.asset.id)
				.then((updatedAsset) => {
					if (!isMounted) return
					if (equal(updatedAsset, currentAsset)) return
					console.debug(`[autoUpdateAsset]`, 'update')
					setCurrentAsset(updatedAsset)
				})
				.catch((err) => console.error(`[useAsset]`, err))
		}

		console.debug(`[autoUpdateAsset]`, 'enabled', autoUpdateIntervalInSeconds)
		const interval = setInterval(
			updateState,
			autoUpdateIntervalInSeconds * 1000,
		)
		return () => {
			console.debug(`[autoUpdateAsset]`, 'disabled')
			clearInterval(interval)
			isMounted = false
		}
	}, [currentAsset, autoUpdateIntervalInSeconds, iot])

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
				asset: currentAsset?.asset,
				twin: currentAsset?.twin,
				deleteAsset: async () => {
					if (currentAsset?.asset === undefined) return
					return iot.deleteThing(currentAsset.asset.id).then(() => {
						setAssetId(undefined)
					})
				},
				update: async ({ name, cfg }) => {
					if (currentAsset?.asset === undefined) return
					const promises: Promise<any>[] = []
					if (name !== undefined) {
						promises.push(iot.updateThing(currentAsset.asset.id, { name }))
					}
					if (cfg !== undefined) {
						promises.push(
							iot.updateShadow(currentAsset.asset.id, { desired: { cfg } }),
						)
					}
					await Promise.all(promises)
					setCurrentAsset({
						...currentAsset,
						asset: {
							...currentAsset.asset,
							name: name ?? currentAsset.asset.name,
						},
						twin: {
							...currentAsset.twin,
							desired: {
								...currentAsset.twin.desired,
								cfg: {
									...defaultConfig,
									...currentAsset.twin.desired?.cfg,
									...cfg,
								},
							},
						},
					})
				},
				error,
			}}
		>
			{children}
		</AssetContext.Provider>
	)
}
