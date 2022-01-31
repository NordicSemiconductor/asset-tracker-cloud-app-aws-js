import type { AssetTwin } from 'asset/state'

export type Asset = { id: string; name: string }
export type AssetWithTwin = {
	asset: Asset
	twin: AssetTwin
}
