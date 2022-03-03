import type { Static } from '@sinclair/typebox'
import type { GNSS, Roaming } from 'asset/asset'
import { useAsset } from 'hooks/useAsset'
import { useCellGeoLocation } from 'hooks/useCellGeoLocation'
import { useCellGeoLocationHistory } from 'hooks/useCellGeoLocationHistory'
import { useGNSSLocationHistory } from 'hooks/useGNSSHistory'
import { useMapSettings } from 'hooks/useMapSettings'
import { useNeighboringCellMeasurementReportGeoLocation } from 'hooks/useNeighboringCellMeasurementReportGeoLocation'
import { createContext, FunctionComponent, useContext } from 'react'

export type Position = { lat: number; lng: number; accuracy: number }

export enum GeoLocationSource {
	GNSS = 'GNSS',
	SingleCell = 'SingleCell',
	NeighboringCell = 'NeighboringCell',
}

export type GeoLocation = {
	position: Position & {
		heading?: number
		altitude?: number
		speed?: number
	}
	batch?: boolean
	ts: Date
	source: GeoLocationSource
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
	source: GeoLocationSource.GNSS,
})

export const MapDataContext = createContext<{
	center?: GeoLocation
	locations: AssetGeoLocation[]
}>({
	locations: [],
})

export const useMapData = () => useContext(MapDataContext)

export const MapDataProvider: FunctionComponent = ({ children }) => {
	const { settings } = useMapSettings()
	const { twin } = useAsset()
	const neighboringCellGeoLocation =
		useNeighboringCellMeasurementReportGeoLocation()
	const cellGeoLocation = useCellGeoLocation()
	const locationHistory = useGNSSLocationHistory()
	const singleCellGeoLocations = useCellGeoLocationHistory()

	const locations: AssetGeoLocation[] = []

	// If history is disabled, use current position (if available)
	if (!settings.history.gnss && twin?.reported?.gnss !== undefined)
		locations.push({
			location: toLocation(twin.reported.gnss),
			roaming: twin.reported.roam,
		})

	// If history is enabled, fetch positions according to selected date range
	if (settings.history.gnss) {
		locations.push(...locationHistory)
	}

	// Add single cell locations if enabled and available
	if (settings.enabledLayers.singleCellGeoLocations) {
		if (settings.history.singleCell) {
			locations.push(...singleCellGeoLocations)
		} else if (cellGeoLocation !== undefined) {
			locations.push(cellGeoLocation)
		}
	}

	// Add neighboring cell locations if enabled and available
	if (settings.enabledLayers.neighboringCellGeoLocations) {
		if (settings.history.neighboringCell) {
			// FIXME: Implement
		} else if (neighboringCellGeoLocation !== undefined) {
			locations.push(neighboringCellGeoLocation)
		}
	}

	// Sort by date, set center to most recent one.
	locations.sort(
		({ location: { ts: t1 } }, { location: { ts: t2 } }) =>
			t2.getTime() - t1.getTime(),
	)

	const center = locations[0]?.location

	return (
		<MapDataContext.Provider
			value={{
				center,
				locations,
			}}
		>
			{children}
		</MapDataContext.Provider>
	)
}
