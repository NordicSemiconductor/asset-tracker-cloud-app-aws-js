import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import type { CellGeoLocation } from 'hooks/useMapData'
import { useCallback, useEffect, useState } from 'react'

export const useCellGeoLocation = (): {
	location?: CellGeoLocation
} => {
	const { twin } = useAsset()
	const [location, setLocation] = useState<CellGeoLocation>()
	const { geolocationApiEndpoint } = useAppConfig()

	const geolocateCell = useCallback<
		(
			args: {
				area: number
				mccmnc: number
				cell: number
				nw: 'ltem' | 'nbiot'
				reportedAt: Date
			},
			retryCount?: number,
			maxTries?: number,
		) => {
			promise: Promise<CellGeoLocation | undefined>
			cancel: () => void
		}
	>(
		({ area, mccmnc, cell, nw, reportedAt }, retryCount = 0, maxTries = 10) => {
			let cancelled = false
			let retryTimeout: NodeJS.Timeout
			const promise = new Promise<CellGeoLocation | undefined>(
				(resolve, reject) => {
					if (retryCount >= maxTries)
						return reject(
							new Error(`Maximum retryCount reached (${retryCount})`),
						)
					fetch(
						`${geolocationApiEndpoint}/cell?${Object.entries({
							area,
							mccmnc,
							cell,
							nw,
						})
							.map(
								([key, value]) =>
									encodeURIComponent(key) + '=' + encodeURIComponent(value),
							)
							.join('&')}`,
					)
						.then(async (res) => {
							if (cancelled) return reject(new Error(`Cancelled.`))
							if (res.status === 200) {
								const geolocation = await res.json()
								console.debug('[useCellLocation:geolocateCell]', {
									cell: { area, mccmnc, cell },
									geolocation,
								})
								return resolve({
									position: geolocation,
									ts: reportedAt,
								})
							} else if (res.status === 409) {
								const expires = res.headers.get('expires')
								const retryInMs =
									expires !== null
										? Math.floor(new Date(expires).getTime() - Date.now())
										: 60000
								console.debug(
									'[useCellLocation:geolocateCell]',
									`Location currently not available, will try again in ${Math.round(
										retryInMs / 1000,
									)} seconds.`,
								)
								retryTimeout = setTimeout(async () => {
									try {
										resolve(
											await geolocateCell(
												{ area, mccmnc, cell, nw, reportedAt },
												retryCount + 1,
											).promise,
										)
									} catch (err) {
										return reject(err)
									}
								}, Math.max(retryInMs, 10000))
							} else if (res.status === 404) {
								console.error(
									'[useCellLocation:geolocateCell]',
									'Geolocation for cell not found',
									{
										cell,
									},
								)
								return reject(new Error(`Geolocation for cell not found.`))
							} else {
								console.error('[useCellLocation:geolocateCell]', res)
								return reject(new Error(`Request failed: ${res.status}.`))
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
		[geolocationApiEndpoint],
	)

	useEffect(() => {
		let isMounted = true
		if (twin?.reported?.roam?.v === undefined) return
		const { cancel, promise } = geolocateCell({
			...twin.reported.roam.v,
			nw: twin.reported.roam.v.nw.includes('NB-IoT') ? 'nbiot' : 'ltem',
			reportedAt: new Date(twin.reported.roam.ts),
		})
		promise
			.then((position) => {
				if (!isMounted) return
				setLocation(position)
			})
			.catch((err) => {
				console.error(`[useCellLocation]`, err.message)
			})

		return () => {
			isMounted = false
			cancel()
		}
	}, [twin, geolocateCell])

	return {
		location,
	}
}
