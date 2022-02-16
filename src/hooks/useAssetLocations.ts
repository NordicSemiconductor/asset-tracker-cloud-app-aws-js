import type { Static } from '@sinclair/typebox'
import type { Asset, GNSS } from 'asset/asset'
import { useState } from 'react'

type AssetLocation = {
	asset: Asset
	position: Static<typeof GNSS>['v']
	ts: Date
}
export const useAssetLocations = (): AssetLocation[] => {
	const [positions] = useState<AssetLocation[]>([])

	// FIXME: implement

	return positions
}
