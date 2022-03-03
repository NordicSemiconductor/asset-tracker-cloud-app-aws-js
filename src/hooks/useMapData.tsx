import {
	cellId,
	NetworkMode,
} from '@nordicsemiconductor/cell-geolocation-helpers'
import type { Static } from '@sinclair/typebox'
import { fetchRoamingData } from 'api/fetchRoamingData'
import { geolocateCell } from 'api/geolocateCell'
import type { GNSS, Roaming } from 'asset/asset'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import { useAssetLocationHistory } from 'hooks/useAssetLocationHistory'
import { useCellGeoLocation } from 'hooks/useCellGeoLocation'
import { useChartDateRange } from 'hooks/useChartDateRange'
import { useMapSettings } from 'hooks/useMapSettings'
import { useNeighboringCellMeasurementReportGeoLocation } from 'hooks/useNeighboringCellMeasurementReportGeoLocation'
import { useServices } from 'hooks/useServices'
import {
	createContext,
	FunctionComponent,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'

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
	const { twin } = useAsset()
	const { settings } = useMapSettings()
	const neighboringCellGeoLocation =
		useNeighboringCellMeasurementReportGeoLocation()
	const { location: cellGeoLocation } = useCellGeoLocation()
	const { history } = useAssetLocationHistory()
	const [locationHistory, setLocationHistory] = useState<AssetGeoLocation[]>([])
	const { asset } = useAsset()
	const {
		range: { start, end },
	} = useChartDateRange()
	const { timestream } = useServices()
	const [singleCellGeoLocations, setSingleCellGeoLocations] = useState<
		{
			roaming: Static<typeof Roaming>
			location: GeoLocation
		}[]
	>([])

	/**
	 * Fetch GNSS history
	 */
	const maxGnssHistoryEntries = settings.history.maxGnssEntries
	const enableGNSSHistory = settings.history.gnss
	useEffect(() => {
		let isMounted = true
		if (!enableGNSSHistory) {
			setLocationHistory([])
			return
		}
		if (asset === undefined) return

		history({
			asset,
			limit: maxGnssHistoryEntries,
			range: { start, end },
		})
			.then((data) => {
				if (!isMounted) {
					return
				}
				setLocationHistory(data)
			})
			.catch((err) => console.error(`[useMapData]`, err))

		return () => {
			isMounted = false
		}
	}, [enableGNSSHistory, asset, start, end, maxGnssHistoryEntries, history])

	/**
	 * Fetch single cell geo location history
	 */
	const maxSingleCellGeoLocationHistoryEntries =
		settings.history.maxSingleCellGeoLocationEntries
	const enabledSingleCellGeoLocationHistory =
		settings.enabledLayers.singleCellGeoLocations && settings.history.singleCell
	const { geolocationApiEndpoint } = useAppConfig()
	const locate = useCallback<ReturnType<typeof geolocateCell>>(
		(args: Parameters<ReturnType<typeof geolocateCell>>[0]) =>
			geolocateCell({
				geolocationApiEndpoint,
			})(args),
		[geolocationApiEndpoint],
	)
	useEffect(() => {
		let isMounted = true
		if (!enabledSingleCellGeoLocationHistory) {
			setSingleCellGeoLocations([])
			return
		}
		if (asset === undefined) return

		fetchRoamingData({
			asset,
			timestream,
			start,
			end,
		})
			// Build list of unique cells
			.then((data) =>
				data.reduce((cellMap, roam) => {
					const id = cellId({
						...roam.v,
						nw: roam.v.nw.includes('NB-IoT')
							? NetworkMode.NBIoT
							: NetworkMode.LTEm,
					})
					if (cellMap[id] === undefined) {
						cellMap[id] = roam
					}
					return cellMap
				}, {} as Record<string, Static<typeof Roaming>>),
			)
			// Resolve
			.then(async (cellMap) =>
				Promise.all(
					Object.values(cellMap).map(async (roam) =>
						locate({
							area: roam.v.area,
							cell: roam.v.cell,
							mccmnc: roam.v.mccmnc,
							nw: roam.v.nw.includes('NB-IoT') ? 'nbiot' : 'ltem',
							reportedAt: new Date(roam.ts),
						}).promise.then((maybeLocation) => {
							// Make locations available immediately as they are resolved
							if (maybeLocation === undefined) return
							if (!isMounted) return
							setSingleCellGeoLocations((locations) => [
								...locations,
								{
									roaming: roam,
									location: {
										source: GeoLocationSource.SingleCell,
										ts: maybeLocation.ts,
										position: maybeLocation.position,
									},
								},
							])
						}),
					),
				),
			)
			.catch((err) => console.error(`[useMapData]`, err))

		return () => {
			isMounted = false
		}
	}, [
		asset,
		maxSingleCellGeoLocationHistoryEntries,
		enabledSingleCellGeoLocationHistory,
		start,
		end,
		locate,
		timestream,
	])

	const locations: AssetGeoLocation[] = []

	// If history is disabled, use current position (if available)
	if (!enableGNSSHistory && twin?.reported?.gnss !== undefined)
		locations.push({
			location: toLocation(twin.reported.gnss),
			roaming: twin.reported.roam,
		})

	// If history is enabled, fetch positions according to selected date range
	if (enableGNSSHistory) {
		locations.push(...locationHistory)
	}

	// Add single cell locations if available
	if (enabledSingleCellGeoLocationHistory) {
		locations.push(...singleCellGeoLocations)
	} else if (
		settings.enabledLayers.singleCellGeoLocations &&
		cellGeoLocation !== undefined
	) {
		locations.push(cellGeoLocation)
	}

	// Add neighboring cell locations if available
	if (neighboringCellGeoLocation !== undefined) {
		locations.push(neighboringCellGeoLocation)
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
