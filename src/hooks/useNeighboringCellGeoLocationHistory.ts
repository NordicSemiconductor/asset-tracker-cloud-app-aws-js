import {
	fetchNeighboringCellMeasurementReports,
	type ParsedNCellMeasReport,
} from 'api/fetchNeighboringCellMeasurementReports'
import { geolocateNeighboringCellMeasurementReport } from 'api/geolocateNeighboringCellMeasurementReport'
import type { Asset } from 'asset/asset'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import { useChartDateRange } from 'hooks/useChartDateRange'
import type { AssetGeoLocation } from 'hooks/useMapData'
import { useMapSettings } from 'hooks/useMapSettings'
import { useServices } from 'hooks/useServices'
import { useCallback, useEffect, useState } from 'react'

/**
 * Provides the cell geo location based on the asset's historical neighboring cell measurements.
 */
export const useNeighboringCellGeoLocationHistory = (): AssetGeoLocation[] => {
	const { settings } = useMapSettings()
	const Limit = settings.history.maxNeighboringCellGeoLocationEntries
	const enabled =
		settings.enabledLayers.neighboringCellGeoLocations &&
		settings.history.neighboringCell
	const [neighboringCellGeoLocations, setNeighboringCellGeoLocations] =
		useState<AssetGeoLocation[]>([])
	const { asset } = useAsset()
	const {
		range: { start, end },
	} = useChartDateRange()
	const { dynamoDB } = useServices()
	const { nCellMeasReportTableName, nCellMeasCellGeolocationApiEndpoint } =
		useAppConfig()

	const geolocateReport = useCallback(
		(report: ParsedNCellMeasReport, retryCount = 0, maxTries = 10) =>
			geolocateNeighboringCellMeasurementReport(
				nCellMeasCellGeolocationApiEndpoint,
			)(report, retryCount, maxTries),
		[nCellMeasCellGeolocationApiEndpoint],
	)

	const fetchReport = useCallback(
		async (args: {
			asset: Asset
			Limit: number
			range?: {
				start: Date
				end: Date
			}
		}) =>
			fetchNeighboringCellMeasurementReports({
				dynamoDB,
				nCellMeasReportTableName,
			})(args),
		[dynamoDB, nCellMeasReportTableName],
	)

	useEffect(() => {
		let isMounted = true
		if (!enabled) {
			setNeighboringCellGeoLocations([])
			return
		}
		if (asset === undefined) return

		const promiseCancellers: (() => void)[] = []

		fetchReport({
			asset,
			Limit,
			range: {
				start,
				end,
			},
		})
			.then(async (reports) =>
				Promise.all(
					reports.map(async (report) => {
						const { cancel, promise } = geolocateReport(report)
						promiseCancellers.push(cancel)
						return promise
					}),
				),
			)
			.then((locations) => {
				if (!isMounted) return
				setNeighboringCellGeoLocations(
					locations.filter((f) => f !== undefined) as AssetGeoLocation[],
				)
			})
			.catch((err) =>
				console.error(`[useNeighboringCellGeoLocationHistory]`, err),
			)

		return () => {
			isMounted = false
			promiseCancellers.map((cancel) => cancel())
		}
	}, [asset, Limit, enabled, start, end, geolocateReport, fetchReport])

	return neighboringCellGeoLocations
}
