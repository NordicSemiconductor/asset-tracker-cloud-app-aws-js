import type { Static } from '@sinclair/typebox'
import type { Asset, AssetTwin } from 'asset/asset'
import { GNSS } from 'asset/asset'
import { useServices } from 'hooks/useServices'
import { useEffect, useState } from 'react'
import { validFilter } from 'utils/validFilter'

type AssetLocation = {
	asset: Asset
	position: Static<typeof GNSS>['v']
	ts: Date
}

const filterGNSS = validFilter(GNSS)

export const useAssetLocations = (): AssetLocation[] => {
	const [positions, setPositions] = useState<AssetLocation[]>([])
	const { iot } = useServices()

	useEffect(() => {
		let isMounted = true

		iot
			.listThings({
				limit: 250,
			})
			.then(async ({ things }) =>
				Promise.all(
					things.map(async ({ thingName }) => iot.getThing(thingName)),
				),
			)
			.then(
				async (assets) =>
					assets.filter(({ twin }) => filterGNSS(twin?.reported?.gnss)) as {
						asset: Asset
						twin: AssetTwin & {
							reported: {
								gnss: Static<typeof GNSS>
							}
						}
					}[],
			)
			.then((assetsWithGNSS) => {
				if (!isMounted) return
				setPositions(
					assetsWithGNSS.map(({ asset, twin }) => ({
						asset,
						position: twin.reported.gnss.v,
						ts: new Date(twin.reported.gnss.ts),
					})),
				)
			})
			.catch(console.error)

		return () => {
			isMounted = false
		}
	}, [iot])

	return positions
}
