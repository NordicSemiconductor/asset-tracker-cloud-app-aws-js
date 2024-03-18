import { geolocateCell } from 'api/geolocateCell.js'
import { useAppConfig } from 'hooks/useAppConfig.js'
import { useAsset } from 'hooks/useAsset.js'
import type { AssetGeoLocation } from 'hooks/useMapData.js'
import { useMapSettings } from 'hooks/useMapSettings.js'
import { useCallback, useEffect, useState } from 'react'

/**
 * Provides the cell geo location based on the asset's current roaming information.
 */
export const useCellGeoLocation = (): AssetGeoLocation | undefined => {
	const { twin } = useAsset()
	const [location, setLocation] = useState<AssetGeoLocation>()
	const { geolocationApiEndpoint } = useAppConfig()
	const locate = useCallback<ReturnType<typeof geolocateCell>>(
		(args: Parameters<ReturnType<typeof geolocateCell>>[0]) =>
			geolocateCell({
				geolocationApiEndpoint,
			})(args),
		[geolocationApiEndpoint],
	)
	const { settings } = useMapSettings()

	const enabled = settings.enabledLayers.singleCellGeoLocations
	useEffect(() => {
		let isMounted = true
		if (!enabled) {
			setLocation(undefined)
			return
		}
		if (twin?.reported?.roam?.v === undefined) return
		const { cancel, promise } = locate({
			...twin.reported.roam.v,
			nw: twin.reported.roam.v.nw.includes('NB-IoT') ? 'nbiot' : 'ltem',
			reportedAt: new Date(twin.reported.roam.ts),
		})
		promise
			.then((location) => {
				if (!isMounted) return
				setLocation(
					location === undefined
						? undefined
						: {
								...location,
								roaming: twin.reported.roam,
							},
				)
			})
			.catch((err) => {
				console.error(`[useCellLocation]`, err.message)
			})

		return () => {
			isMounted = false
			cancel()
		}
	}, [twin, enabled, locate])

	return location
}
