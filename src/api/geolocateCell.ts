import {
	cellId,
	NetworkMode,
} from '@nordicsemiconductor/cell-geolocation-helpers'
import { AssetGeoLocation, AssetGeoLocationSource } from 'hooks/useMapData'

/**
 * Looks up cell geolocation.
 *
 * Because these lookups will be handed by a looking up the data from a third
 * party API, it may take a while for them to be resolved, so this function
 * also can be cancelled.
 */
export const geolocateCell =
	({
		geolocationApiEndpoint,
		retryCount,
		maxTries,
	}: {
		geolocationApiEndpoint: URL
		retryCount?: number
		maxTries?: number
	}) =>
	({
		area,
		mccmnc,
		cell,
		nw,
		reportedAt,
	}: {
		area: number
		mccmnc: number
		cell: number
		nw: 'ltem' | 'nbiot'
		reportedAt: Date
	}): {
		promise: Promise<Omit<AssetGeoLocation, 'roaming'> | undefined>
		cancel: () => void
	} => {
		let cancelled = false
		let retryTimeout: NodeJS.Timeout
		const id = cellId({
			area,
			mccmnc,
			cell,
			nw: nw === 'nbiot' ? NetworkMode.NBIoT : NetworkMode.LTEm,
		})
		const promise = new Promise<Omit<AssetGeoLocation, 'roaming'> | undefined>(
			(resolve, reject) => {
				if ((retryCount ?? 0) >= (maxTries ?? 10))
					return reject(
						new Error(
							`Maximum retryCount reached (${retryCount}) resolving cell ${id}`,
						),
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
							console.debug('[geolocateCell]', id, {
								cell: { area, mccmnc, cell },
								geolocation,
							})
							return resolve({
								location: {
									position: geolocation,
									ts: reportedAt,
									source: AssetGeoLocationSource.SingleCell,
								},
							})
						} else if (res.status === 409) {
							const expires = res.headers.get('expires')
							const retryInMs =
								expires !== null
									? Math.floor(new Date(expires).getTime() - Date.now())
									: 60000
							console.debug(
								'[geolocateCell]',
								id,
								`Location currently not available, will try again in ${Math.round(
									retryInMs / 1000,
								)} seconds.`,
							)
							retryTimeout = setTimeout(async () => {
								try {
									resolve(
										await geolocateCell({
											geolocationApiEndpoint,
											retryCount: (retryCount ?? 0) + 1,
											maxTries,
										})({ area, mccmnc, cell, nw, reportedAt }).promise,
									)
								} catch (err) {
									return reject(err)
								}
							}, Math.max(retryInMs, 10000))
						} else if (res.status === 404) {
							console.error(
								'[geolocateCell]',
								id,
								'Geolocation for cell not found',
								{
									cell,
								},
							)
							return reject(new Error(`Geolocation for cell ${id} not found.`))
						} else {
							console.error('[geolocateCell]', id, res)
							return reject(
								new Error(`Request failed for cell ${id}: ${res.status}.`),
							)
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
