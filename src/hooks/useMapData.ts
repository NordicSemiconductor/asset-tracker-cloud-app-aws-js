import type { AssetHistory, AssetHistoryDatum, GNSS } from 'asset/asset'

export type Position = { lat: number; lng: number }

export type Location = {
	position: Position & {
		accuracy?: number
		heading?: number
		altitude?: number
		speed?: number
	}
	batch: boolean
	ts: Date
}

export type CellLocation = {
	position: Position & { accuracy: number }
	ts: Date
}

export type Roaming = {
	roaming: {
		mccmnc: number
		rsrp: number
		cell: number
		area: number
		ip: string
	}
	ts: Date
}

export type AssetLocation = {
	location: Location
	roaming?: Roaming
}

const toLocation =
	(batch = false) =>
	(locationHistory: AssetHistoryDatum<GNSS>): AssetLocation => ({
		location: {
			position: {
				lat: locationHistory.v.lat,
				lng: locationHistory.v.lng,
				accuracy: locationHistory.v.acc,
				altitude: locationHistory.v.alt,
				speed: locationHistory.v.spd,
				heading: locationHistory.v.hdg,
			},
			batch,
			ts: new Date(locationHistory.ts),
		},
		roaming: undefined, // FIXME: implement
	})

export const useMapData = ({
	locations,
}: {
	locations: AssetHistory<GNSS>
}): {
	assetLocations: AssetLocation[]
	center?: AssetLocation
} => {
	// FIXME: implement batch info
	const assetLocations = locations?.map(toLocation(false)) ?? []
	return {
		center: assetLocations[0],
		assetLocations,
	}
}
