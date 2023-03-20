import type { ParsedNCellMeasReport } from 'api/fetchNeighboringCellMeasurementReports'
import { AssetGeoLocationSource, type AssetGeoLocation } from 'hooks/useMapData'

export const reportToLocation = (
	report: ParsedNCellMeasReport &
		Required<Pick<ParsedNCellMeasReport, 'position'>>,
): AssetGeoLocation => {
	return {
		location: {
			position: report.position,
			ts: report.reportedAt,
			source: AssetGeoLocationSource.NeighboringCell,
		},
		roaming: {
			ts: report.reportedAt.getTime(),
			v: {
				area: report.area,
				cell: report.cell,
				mccmnc: parseInt(
					`${report.mcc}${report.mnc.toString().padStart(2, '0')}`,
					10,
				),
				rsrp: report.rsrp,
				nw: report.nw,
			},
		},
	}
}

export const geolocateNeighboringCellMeasurementReport =
	(nCellMeasCellGeolocationApiEndpoint: URL) =>
	(
		report: ParsedNCellMeasReport,
		retryCount = 0,
		maxTries = 10,
	): {
		promise: Promise<AssetGeoLocation | undefined>
		cancel: () => void
	} => {
		if (report.unresolved !== undefined) {
			const position = report.position
			if (position !== undefined)
				// Already resolved
				return {
					promise: Promise.resolve(
						reportToLocation({
							...report,
							position,
						}),
					),
					cancel: () => undefined,
				}
		}

		let cancelled = false
		let retryTimeout: NodeJS.Timeout
		const promise = new Promise<AssetGeoLocation | undefined>(
			(resolve, reject) => {
				if (report === undefined) return reject(new Error(`No report defined`))
				if (report.unresolved !== undefined) {
					const position = report.position
					return resolve(
						position !== undefined
							? reportToLocation({
									...report,
									position,
							  })
							: undefined,
					)
				}
				if (retryCount >= maxTries) {
					return reject(new Error(`Maximum retryCount reached (${retryCount})`))
				}
				console.debug(
					'[geolocateNeighboringCellMeasurementReport]',
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
							console.debug('[geolocateNeighboringCellMeasurementReport]', {
								location,
							})
							const cellGeoLocation: AssetGeoLocation = reportToLocation({
								...report,
								position:
									location as unknown as AssetGeoLocation['location']['position'],
							})
							return resolve(cellGeoLocation)
						} else if (res.status === 409) {
							const expires = res.headers.get('expires')
							const retryInMs =
								expires !== null
									? Math.floor(new Date(expires).getTime() - Date.now())
									: 60000
							console.debug(
								'[geolocateNeighboringCellMeasurementReport]',
								`Location currently not available, will try again in ${Math.round(
									retryInMs / 1000,
								)} seconds.`,
							)
							retryTimeout = setTimeout(async () => {
								try {
									resolve(
										await geolocateNeighboringCellMeasurementReport(
											nCellMeasCellGeolocationApiEndpoint,
										)(report, retryCount + 1).promise,
									)
								} catch (err) {
									return reject(err)
								}
							}, Math.max(retryInMs, 10000))
						} else if (res.status === 404) {
							console.error(
								'[geolocateNeighboringCellMeasurementReport]',
								'Geolocation for neighboring cell report not found',
								{
									reportId: report.reportId,
								},
							)
							console.error(
								'[geolocateNeighboringCellMeasurementReport]',
								`Geolocation for neighboring cell report not found.`,
							)
							return resolve(undefined)
						} else {
							console.error('[geolocateNeighboringCellMeasurementReport]', res)
							console.error(
								'[geolocateNeighboringCellMeasurementReport]',
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
	}
