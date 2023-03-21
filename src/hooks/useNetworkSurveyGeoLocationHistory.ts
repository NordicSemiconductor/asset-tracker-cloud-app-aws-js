import {
	fetchNetworkSurveys,
	type ParsedNetworkSurvey,
} from 'api/fetchNetworkSurveys'
import { geolocateNetworkSurvey } from 'api/geolocateNetworkSurvey'
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
export const useNetworkSurveyGeoLocationHistory = (): AssetGeoLocation[] => {
	const { settings } = useMapSettings()
	const Limit = settings.history.maxNetworkSurveyGeoLocationEntries
	const enabled =
		settings.enabledLayers.neighboringCellGeoLocations &&
		settings.history.neighboringCell
	const [neighboringCellGeoLocations, setNetworkSurveyGeoLocations] = useState<
		AssetGeoLocation[]
	>([])
	const { asset } = useAsset()
	const {
		range: { start, end },
	} = useChartDateRange()
	const { dynamoDB } = useServices()
	const { networkSurveyTableName, networkSurveyGeolocationApiEndpoint } =
		useAppConfig()

	const geolocateReport = useCallback(
		(survey: ParsedNetworkSurvey, retryCount = 0, maxTries = 10) =>
			geolocateNetworkSurvey(networkSurveyGeolocationApiEndpoint)(
				survey,
				retryCount,
				maxTries,
			),
		[networkSurveyGeolocationApiEndpoint],
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
			fetchNetworkSurveys({
				dynamoDB,
				networkSurveyTableName,
			})(args),
		[dynamoDB, networkSurveyTableName],
	)

	useEffect(() => {
		let isMounted = true
		if (!enabled) {
			setNetworkSurveyGeoLocations([])
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
				setNetworkSurveyGeoLocations(
					locations.filter((f) => f !== undefined) as AssetGeoLocation[],
				)
			})
			.catch((err) =>
				console.error(`[useNetworkSurveyGeoLocationHistory]`, err),
			)

		return () => {
			isMounted = false
			promiseCancellers.map((cancel) => cancel())
		}
	}, [asset, Limit, enabled, start, end, geolocateReport, fetchReport])

	return neighboringCellGeoLocations
}
