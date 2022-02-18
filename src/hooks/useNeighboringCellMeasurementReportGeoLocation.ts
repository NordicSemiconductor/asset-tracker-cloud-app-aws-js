import { useAppConfig } from 'hooks/useAppConfig'
import type { CellGeoLocation } from 'hooks/useMapData'
import { useNeighboringCellMeasurementReport } from 'hooks/useNeighboringCellMeasurementReport'
import { useCallback, useEffect, useState } from 'react'

export const useNeighboringCellMeasurementReportGeoLocation = ():
	| CellGeoLocation
	| undefined => {
	const { report } = useNeighboringCellMeasurementReport()
	const [location, setLocation] = useState<CellGeoLocation>()
	const { nCellMeasCellGeolocationApiEndpoint } = useAppConfig()

	const reportId = report?.reportId

	const geolocateReport = useCallback<
		(
			retryCount?: number,
			maxTries?: number,
		) => {
			promise: Promise<CellGeoLocation | undefined>
			cancel: () => void
		}
	>(
		(retryCount = 0, maxTries = 10) => {
			let cancelled = false
			let retryTimeout: NodeJS.Timeout
			const promise = new Promise<CellGeoLocation | undefined>(
				(resolve, reject) => {
					if (report === undefined)
						return reject(new Error(`No report defined`))
					if (report.unresolved !== undefined)
						return resolve(
							report.position !== undefined
								? {
										position: report.position,
										ts: report.reportedAt,
								  }
								: undefined,
						)
					if (retryCount >= maxTries) {
						return reject(
							new Error(`Maximum retryCount reached (${retryCount})`),
						)
					}
					console.debug(
						'[nCellMeas:geolocateReport]',
						`Locating report`,
						report.reportId,
					)
					fetch(
						`${nCellMeasCellGeolocationApiEndpoint}/report/${report.reportId}/location`,
					)
						.then(async (res) => {
							if (cancelled) return reject(new Error(`Cancelled.`))
							if (res.status === 200) {
								const location = await res.json()
								console.debug('[nCellMeas:geolocateReport]', {
									location,
								})
								const cellGeoLocation: CellGeoLocation = {
									position: location as unknown as CellGeoLocation['position'],
									ts: report.reportedAt,
								}
								return resolve(cellGeoLocation)
							} else if (res.status === 409) {
								const expires = res.headers.get('expires')
								const retryInMs =
									expires !== null
										? Math.floor(new Date(expires).getTime() - Date.now())
										: 60000
								console.debug(
									'[nCellMeas:geolocateReport]',
									`Location currently not available, will try again in ${Math.round(
										retryInMs / 1000,
									)} seconds.`,
								)
								retryTimeout = setTimeout(async () => {
									try {
										resolve(await geolocateReport(retryCount + 1).promise)
									} catch (err) {
										return reject(err)
									}
								}, Math.max(retryInMs, 10000))
							} else if (res.status === 404) {
								console.error(
									'[nCellMeas:geolocateReport]',
									'Geolocation for neighboring cell report not found',
									{
										reportId: report.reportId,
									},
								)
								console.error(
									'[nCellMeas:geolocateReport]',
									`Geolocation for neighboring cell report not found.`,
								)
								return resolve(undefined)
							} else {
								console.error('[nCellMeas:geolocateReport]', res)
								console.error(
									'[nCellMeas:geolocateReport]',
									`Request failed: ${res.status}.`,
								)
								return resolve(undefined)
							}
						})
						.catch(reject)
				},
			)
			return {
				promise,
				cancel: () => {
					cancelled = true
					clearTimeout(retryTimeout)
				},
			}
		},
		[report, nCellMeasCellGeolocationApiEndpoint],
	)

	useEffect(() => {
		let isMounted = true
		if (report === undefined) return // No report defined
		if (report.unresolved !== undefined) {
			if (report.position !== undefined)
				setLocation({
					position: report.position,
					ts: report.reportedAt,
				})
			return // Already resolved
		}
		const { cancel, promise } = geolocateReport()
		promise
			.then((position) => {
				if (!isMounted) return
				setLocation(position)
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
	}, [reportId, report, geolocateReport])

	return location
}
