import {
	GNSS,
	type GNSSData,
} from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'
import type { Asset, AssetTwin, AssetWithTwin } from 'asset/asset.js'
import { useServices } from 'hooks/useServices.js'
import { useEffect, useState } from 'react'
import { validFilter } from 'utils/validFilter.js'

type AssetLocation = {
	asset: Asset
	position: GNSSData['v']
	ts: Date
}

const filterGNSS = validFilter(GNSS)

export const useAssetLocations = (): AssetLocation[] => {
	const [positions, setPositions] = useState<AssetLocation[]>([])
	const { iot } = useServices()
	const [paginationInfo, setPaginationInfo] = useState<{
		fetchedStartKeys: string[]
		nextStartKey?: string
	}>({
		fetchedStartKeys: [],
	})
	const { nextStartKey: startKey, fetchedStartKeys } = paginationInfo

	useEffect(() => {
		let isMounted = true
		if (fetchedStartKeys.includes(startKey ?? '')) return

		iot
			.listThings({ startKey })
			.then(async ({ things, nextStartKey }) =>
				Promise.all(
					things.map(async (asset) =>
						iot
							.getTwin(asset.id)
							.then((twin) => ({ asset, twin }) as AssetWithTwin),
					),
				)
					.then(
						(assets) =>
							assets.filter(({ twin }) =>
								filterGNSS(twin?.reported?.gnss),
							) as (AssetWithTwin & {
								twin: AssetTwin & {
									reported: {
										gnss: GNSSData
									}
								}
							})[],
					)
					.then((assetsWithGNSS) => {
						if (!isMounted) {
							console.debug(`[useAssetLocations]`, 'unmounted')
							return
						}
						setPositions((positions) => [
							...positions,
							...assetsWithGNSS.map(({ asset, twin }) => ({
								asset,
								position: twin.reported.gnss.v,
								ts: new Date(twin.reported.gnss.ts),
							})),
						])
						setPaginationInfo((paginationInfo) => ({
							nextStartKey,
							fetchedStartKeys: [
								...paginationInfo.fetchedStartKeys,
								startKey ?? '',
							],
						}))
					}),
			)
			.catch((error) => {
				console.error(`[useAssetLocations]`, error.message)
			})

		return () => {
			isMounted = false
		}
	}, [iot, startKey, fetchedStartKeys])

	return positions
}
