import { geolocateCell } from 'api/geolocateCell'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import type { AssetGeoLocation } from 'hooks/useMapData'
import { useEffect, useState } from 'react'
import { useMapSettings } from './useMapSettings'

export const useCellGeoLocation = (): {
	location?: AssetGeoLocation
} => {
	const { twin } = useAsset()
	const [location, setLocation] = useState<AssetGeoLocation>()
	const { geolocationApiEndpoint } = useAppConfig()
	const locate = geolocateCell({
		geolocationApiEndpoint,
	})
	const { settings } = useMapSettings()

	const enabled = settings.enabledLayers.singleCellGeoLocations
	useEffect(() => {
		let isMounted = true
		if (!enabled) return
		if (twin?.reported?.roam?.v === undefined) return
		const { cancel, promise } = locate({
			...twin.reported.roam.v,
			nw: twin.reported.roam.v.nw.includes('NB-IoT') ? 'nbiot' : 'ltem',
			reportedAt: new Date(twin.reported.roam.ts),
		})
		promise
			.then((position) => {
				if (!isMounted) return
				setLocation(
					position === undefined
						? undefined
						: {
								location: position,
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
	}, [twin, geolocateCell, enabled])

	return {
		location,
	}
}
