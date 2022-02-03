import type { Asset, GNSS } from 'asset/asset'
import { useState } from 'react'

type AssetLocation = {
	asset: Asset
	position: GNSS
	ts: Date
}
export const useAssetLocations = (): AssetLocation[] => {
	const [positions] = useState<AssetLocation[]>([])

	// FIXME: implement

	return positions
}
