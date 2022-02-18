import type { Static } from '@sinclair/typebox'
import type { Asset, GNSS } from 'asset/asset'
import { useServices } from 'hooks/useServices'
import { useEffect, useState } from 'react'

type AssetLocation = {
	asset: Asset
	position: Static<typeof GNSS>['v']
	ts: Date
}
export const useAssetLocations = (): AssetLocation[] => {
	const [positions] = useState<AssetLocation[]>([])

	const { iot } = useServices()

	// FIXME: implement

	useEffect(() => {
		let isMounted = true

		return () => {
			isMounted = false
		}
	}, [iot])

	return positions
}
