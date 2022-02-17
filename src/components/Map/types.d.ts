import type { Static } from '@sinclair/typebox'
import type { Roaming } from 'asset/asset'

export type Position = { lat: number; lng: number }

export type GeoLocation = {
	position: Position & {
		accuracy?: number
		heading?: number
		altitude?: number
		speed?: number
	}
	batch: boolean
	ts: Date
}

export type CellGeoLocation = {
	position: Position & { accuracy: number }
	ts: Date
}

export type AssetGeoLocation = {
	location: GeoLocation
	/** Roaming information */
	roaming?: Static<typeof Roaming>
}
