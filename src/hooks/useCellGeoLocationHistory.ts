import {
	cellId,
	NetworkMode,
} from '@nordicsemiconductor/cell-geolocation-helpers'
import type { Static } from '@sinclair/typebox'
import { fetchRoamingData } from 'api/fetchRoamingData'
import { geolocateCell } from 'api/geolocateCell'
import type { Roaming } from 'asset/asset'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import { useChartDateRange } from 'hooks/useChartDateRange'
import type { AssetGeoLocation } from 'hooks/useMapData'
import { useMapSettings } from 'hooks/useMapSettings'
import { useServices } from 'hooks/useServices'
import { useCallback, useEffect, useState } from 'react'

/**
 * Provides the cell geo location based on the asset's historical roaming information.
 */
export const useCellGeoLocationHistory = (): AssetGeoLocation[] => {
	const { settings } = useMapSettings()
	const maxSingleCellGeoLocationHistoryEntries =
		settings.history.maxSingleCellGeoLocationEntries
	const enabledSingleCellGeoLocationHistory =
		settings.enabledLayers.singleCellGeoLocations && settings.history.singleCell
	const { geolocationApiEndpoint } = useAppConfig()
	const [singleCellGeoLocations, setSingleCellGeoLocations] = useState<
		AssetGeoLocation[]
	>([])
	const { asset } = useAsset()
	const {
		range: { start, end },
	} = useChartDateRange()
	const { timestream } = useServices()

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
				data
					// Remove old (the first roaming data we've built will be older than the start, so remove that)
					.filter(({ ts }) => ts > start.getTime())
					.reduce((cellMap, roam) => {
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
									...maybeLocation,
									roaming: roam,
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

	return singleCellGeoLocations
}
