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

export type AssetGeoLocation = {
	location: GeoLocation
	roaming?: Roaming
}

const toLocation =
	(batch = false) =>
	(locationHistory: GeoLocation): AssetGeoLocation => ({
		location: {
			position: {
				lat: locationHistory.position.lat,
				lng: locationHistory.position.lng,
				accuracy: locationHistory.position.accuracy,
				altitude: locationHistory.position.altitude,
				speed: locationHistory.position.speed,
				heading: locationHistory.position.heading,
			},
			batch,
			ts: new Date(locationHistory.ts),
		},
		roaming: undefined, // FIXME: implement
	})

export const useMapData = ({
	locations,
}: {
	locations: GeoLocation[]
}): {
	assetLocations: AssetGeoLocation[]
	center?: AssetGeoLocation
} => {
	// FIXME: implement batch info
	const assetLocations = locations?.map(toLocation(false)) ?? []
	return {
		center: assetLocations[0],
		assetLocations,
	}
}
