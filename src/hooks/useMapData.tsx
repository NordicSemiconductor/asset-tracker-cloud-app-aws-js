import type { Static } from '@sinclair/typebox'
import type { GNSS, Roaming } from 'asset/asset'
import { useAsset } from 'hooks/useAsset'
import { useAssetLocationHistory } from 'hooks/useAssetLocationHistory'
import { useCellGeoLocation } from 'hooks/useCellGeoLocation'
import { useMapSettings } from 'hooks/useMapSettings'
import { useNeighboringCellMeasurementReportGeoLocation } from 'hooks/useNeighboringCellMeasurementReportGeoLocation'

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

const toLocation = (gnss: Static<typeof GNSS>): GeoLocation => ({
	position: {
		lat: gnss.v.lat,
		lng: gnss.v.lng,
		accuracy: gnss.v.acc,
		altitude: gnss.v.alt,
		heading: gnss.v.hdg,
		speed: gnss.v.spd,
	},
	ts: new Date(gnss.ts),
	batch: false,
})

export const useMapData = (): {
	center?: GeoLocation
	locations: AssetGeoLocation[]
	neighboringCellGeoLocation?: CellGeoLocation
	cellGeoLocation?: CellGeoLocation
} => {
	const { twin } = useAsset()
	const { settings } = useMapSettings()
	const neighboringCellGeoLocation =
		useNeighboringCellMeasurementReportGeoLocation()
	const { location: cellGeoLocation } = useCellGeoLocation()
	const enableHistory = settings.enabledLayers.history
	const locationHistory = useAssetLocationHistory({
		disabled: !enableHistory,
	})

	const locations: AssetGeoLocation[] = []

	// If history is disabled, use current position (if available)
	if (!enableHistory && twin?.reported?.gnss !== undefined)
		locations.push({
			location: toLocation(twin.reported.gnss),
			roaming: twin.reported.roam,
		})

	// If history is enabled, fetch positions according to selected date range
	if (enableHistory) {
		locations.push(...locationHistory)
	}

	// Take loast known locations and sort by date, set center to most recent one.
	const possibleCenters = [
		locations?.[0]?.location,
		neighboringCellGeoLocation,
		cellGeoLocation,
		locationHistory[0]?.location,
	].filter((f) => f !== undefined) as GeoLocation[]
	possibleCenters.sort(({ ts: t1 }, { ts: t2 }) => t2.getTime() - t1.getTime())
	const center = possibleCenters[0]

	return {
		center,
		locations,
		neighboringCellGeoLocation,
		cellGeoLocation,
	}
}
