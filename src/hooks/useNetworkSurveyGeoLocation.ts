import type { ParsedNetworkSurvey } from 'api/fetchNetworkSurveys'
import { geolocateNetworkSurvey } from 'api/geolocateNetworkSurvey'
import { useAppConfig } from 'hooks/useAppConfig'
import type { AssetGeoLocation } from 'hooks/useMapData'
import { useMapSettings } from 'hooks/useMapSettings'
import { useNetworkSurvey } from 'hooks/useNetworkSurvey'
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
