import type {
	GNSSData,
	RoamingInfoData,
} from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'
import { useAsset } from 'hooks/useAsset.js'
import { useCellGeoLocation } from 'hooks/useCellGeoLocation.js'
import { useCellGeoLocationHistory } from 'hooks/useCellGeoLocationHistory.js'
import { useGNSSLocationHistory } from 'hooks/useGNSSHistory.js'
import { useMapSettings } from 'hooks/useMapSettings.js'
import { useNetworkSurveyGeoLocation } from 'hooks/useNetworkSurveyGeoLocation.js'
import { useNetworkSurveyGeoLocationHistory } from 'hooks/useNetworkSurveyGeoLocationHistory.js'
import {
	createContext,
	useContext,
	type FunctionComponent,
	type ReactNode,
} from 'react'

export type Position = { lat: number; lng: number; accuracy: number }

export enum AssetGeoLocationSource {
	GNSS = 'GNSS',
	SingleCell = 'SingleCell',
	NetworkSurvey = 'NetworkSurvey',
}

export type AssetGeoLocation = {
	location: {
		position: Position & {
			heading?: number
			altitude?: number
			speed?: number
		}
		batch?: boolean
		ts: Date
		source: AssetGeoLocationSource
	}
	/** Roaming information */
	roaming?: Omit<RoamingInfoData, 'v'> & {
		v: Omit<RoamingInfoData['v'], 'band' | 'ip'> &
			Partial<Pick<RoamingInfoData['v'], 'band' | 'ip'>>
	}
}

const toLocation = (
	gnss: GNSSData,
	roam?: RoamingInfoData,
): AssetGeoLocation => ({
	location: {
		position: {
			lat: gnss.v.lat,
			lng: gnss.v.lng,
			accuracy: gnss.v.acc,
			altitude: gnss.v.alt,
			heading: gnss.v.hdg,
			speed: gnss.v.spd,
		},
		ts: new Date(gnss.ts),
		source: AssetGeoLocationSource.GNSS,
	},
	roaming: roam,
})

export const MapDataContext = createContext<{
	center?: AssetGeoLocation
	locations: AssetGeoLocation[]
}>({
	locations: [],
})

export const useMapData = () => useContext(MapDataContext)

export const MapDataProvider: FunctionComponent<{ children: ReactNode }> = ({
	children,
}) => {
	const { settings } = useMapSettings()
	const { twin } = useAsset()
	const neighboringCellGeoLocation = useNetworkSurveyGeoLocation()
	const cellGeoLocation = useCellGeoLocation()
	const locationHistory = useGNSSLocationHistory()
	const singleCellGeoLocations = useCellGeoLocationHistory()
	const neighboringCellLocations = useNetworkSurveyGeoLocationHistory()

	const locations: AssetGeoLocation[] = []

	// If history is disabled, use current position (if available)
	if (!settings.history.gnss && twin?.reported?.gnss !== undefined)
		locations.push(
			toLocation(
				twin.reported.gnss,
				twin.reported.roam !== undefined &&
					twin.reported.roam.ts <= twin.reported.gnss.ts
					? twin.reported.roam
					: undefined,
			),
		)

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
			locations.push(...neighboringCellLocations)
		} else if (neighboringCellGeoLocation !== undefined) {
			locations.push(neighboringCellGeoLocation)
		}
	}

	// Sort by date, set center to most recent one.
	locations.sort(
		({ location: { ts: t1 } }, { location: { ts: t2 } }) =>
			t2.getTime() - t1.getTime(),
	)

	const center = locations[0]

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
