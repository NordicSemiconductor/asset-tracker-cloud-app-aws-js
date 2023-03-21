import type { ParsedNetworkSurvey } from 'api/fetchNetworkSurveys'
import { AssetGeoLocationSource, type AssetGeoLocation } from 'hooks/useMapData'

export const surveyToLocation = (
	survey: ParsedNetworkSurvey & Required<Pick<ParsedNetworkSurvey, 'position'>>,
): AssetGeoLocation => {
	const loc: AssetGeoLocation = {
		location: {
			position: survey.position,
			ts: new Date(survey.timestamp),
			source: AssetGeoLocationSource.NetworkSurvey,
		},
	}
	if (survey.lte !== undefined && survey.nw !== undefined) {
		loc.roaming = {
			ts: new Date(survey.timestamp).getTime(),
			v: {
				area: survey.lte.area,
				cell: survey.lte.cell,
				mccmnc: parseInt(
					`${survey.lte.mcc}${survey.lte.mnc.toString().padStart(2, '0')}`,
					10,
				),
				rsrp: survey.lte.rsrp,
				nw: survey.nw,
			},
		}
	}
	return loc
}

export const geolocateNetworkSurvey =
	(networkSurveyGeolocationApiEndpoint: URL) =>
	(
		survey: ParsedNetworkSurvey,
		retryCount = 0,
		maxTries = 10,
	): {
		promise: Promise<AssetGeoLocation | undefined>
		cancel: () => void
	} => {
		if (survey.unresolved !== undefined) {
			const position = survey.position
			if (position !== undefined)
				// Already resolved
				return {
					promise: Promise.resolve(
						surveyToLocation({
							...survey,
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
				if (survey === undefined) return reject(new Error(`No report defined`))
				if (survey.unresolved !== undefined) {
					const position = survey.position
					return resolve(
						position !== undefined
							? surveyToLocation({
									...survey,
									position,
							  })
							: undefined,
					)
				}
				if (retryCount >= maxTries) {
					return reject(new Error(`Maximum retryCount reached (${retryCount})`))
				}
				console.debug(
					'[geolocateNetworkSurvey]',
					`Locating report`,
					survey.surveyId,
				)
				fetch(`${networkSurveyGeolocationApiEndpoint}/${survey.surveyId}`)
					.then(async (res) => {
						if (cancelled) return reject(new Error(`Cancelled.`))
						if (res.status === 200) {
							const location = await res.json()
							console.debug('[geolocateNetworkSurvey]', {
								location,
							})
							const cellGeoLocation: AssetGeoLocation = surveyToLocation({
								...survey,
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
								'[geolocateNetworkSurvey]',
								`Location currently not available, will try again in ${Math.round(
									retryInMs / 1000,
								)} seconds.`,
							)
							retryTimeout = setTimeout(async () => {
								try {
									resolve(
										await geolocateNetworkSurvey(
											networkSurveyGeolocationApiEndpoint,
										)(survey, retryCount + 1).promise,
									)
								} catch (err) {
									return reject(err)
								}
							}, Math.max(retryInMs, 10000))
						} else if (res.status === 404) {
							console.error(
								'[geolocateNetworkSurvey]',
								'Geolocation for neighboring cell report not found',
								{
									surveyId: survey.surveyId,
								},
							)
							console.error(
								'[geolocateNetworkSurvey]',
								`Geolocation for neighboring cell report not found.`,
							)
							return resolve(undefined)
						} else {
							console.error('[geolocateNetworkSurvey]', res)
							console.error(
								'[geolocateNetworkSurvey]',
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
