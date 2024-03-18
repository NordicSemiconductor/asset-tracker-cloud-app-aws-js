import type { ParsedNetworkSurvey } from 'api/fetchNetworkSurveys.js'
import { geolocateNetworkSurvey } from 'api/geolocateNetworkSurvey.js'
import { useAppConfig } from 'hooks/useAppConfig.js'
import type { AssetGeoLocation } from 'hooks/useMapData.js'
import { useMapSettings } from 'hooks/useMapSettings.js'
import { useNetworkSurvey } from 'hooks/useNetworkSurvey.js'
import { useCallback, useEffect, useState } from 'react'

export const useNetworkSurveyGeoLocation = (): AssetGeoLocation | undefined => {
	const report = useNetworkSurvey()
	const [location, setLocation] = useState<AssetGeoLocation>()
	const { networkSurveyGeolocationApiEndpoint } = useAppConfig()
	const { settings } = useMapSettings()

	const surveyId = report?.surveyId

	const enabled = settings.enabledLayers.neighboringCellGeoLocations

	const geolocateReport = useCallback(
		(report: ParsedNetworkSurvey, retryCount = 0, maxTries = 10) =>
			geolocateNetworkSurvey(networkSurveyGeolocationApiEndpoint)(
				report,
				retryCount,
				maxTries,
			),
		[networkSurveyGeolocationApiEndpoint],
	)

	useEffect(() => {
		let isMounted = true
		if (report === undefined) return // No report defined
		if (!enabled) {
			setLocation(undefined)
			return
		}
		const { cancel, promise } = geolocateReport(report)
		promise
			.then((location) => {
				if (!isMounted) return
				if (location === undefined) return
				setLocation(location)
			})
			.catch((err) => {
				console.error(`[useNetworkSurveyGeoLocation]`, err.message)
			})
		return () => {
			isMounted = false
			cancel()
		}
	}, [surveyId, report, geolocateReport, enabled])

	return location
}
