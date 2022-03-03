import { geolocateNeighboringCellMeasurementReport } from 'api/geolocateNeighboringCellMeasurementReport'
import { useAppConfig } from 'hooks/useAppConfig'
import type { AssetGeoLocation } from 'hooks/useMapData'
import { useMapSettings } from 'hooks/useMapSettings'
import { useNeighboringCellMeasurementReport } from 'hooks/useNeighboringCellMeasurementReport'
import { useCallback, useEffect, useState } from 'react'

export const useNeighboringCellMeasurementReportGeoLocation = ():
	| AssetGeoLocation
	| undefined => {
	const report = useNeighboringCellMeasurementReport()
	const [location, setLocation] = useState<AssetGeoLocation>()
	const { nCellMeasCellGeolocationApiEndpoint } = useAppConfig()
	const { settings } = useMapSettings()

	const reportId = report?.reportId

	const enabled = settings.enabledLayers.neighboringCellGeoLocations

	const geolocateReport = useCallback(
		(args) =>
			geolocateNeighboringCellMeasurementReport(
				nCellMeasCellGeolocationApiEndpoint,
			)(args),
		[nCellMeasCellGeolocationApiEndpoint],
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
				console.error(
					`[useNeighboringCellMeasurementReportGeoLocation]`,
					err.message,
				)
			})
		return () => {
			isMounted = false
			cancel()
		}
	}, [reportId, report, geolocateReport, enabled])

	return location
}
