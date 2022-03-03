import { useAsset } from 'hooks/useAsset'
import { useAssetLocationHistory } from 'hooks/useAssetLocationHistory'
import { useChartDateRange } from 'hooks/useChartDateRange'
import type { AssetGeoLocation } from 'hooks/useMapData'
import { useMapSettings } from 'hooks/useMapSettings'
import { useEffect, useState } from 'react'

/**
 * Provides the geo location based on the asset's historical GNSS information.
 */
export const useGNSSLocationHistory = (): AssetGeoLocation[] => {
	const { settings } = useMapSettings()
	const { asset } = useAsset()
	const {
		range: { start, end },
	} = useChartDateRange()
	const { history } = useAssetLocationHistory()
	const [locationHistory, setLocationHistory] = useState<AssetGeoLocation[]>([])

	const maxGnssHistoryEntries = settings.history.maxGnssEntries
	const enableGNSSHistory = settings.history.gnss
	useEffect(() => {
		let isMounted = true
		if (!enableGNSSHistory) {
			setLocationHistory([])
			return
		}
		if (asset === undefined) return

		history({
			asset,
			limit: maxGnssHistoryEntries,
			range: { start, end },
		})
			.then((data) => {
				if (!isMounted) {
					return
				}
				setLocationHistory(data)
			})
			.catch((err) => console.error(`[useMapData]`, err))

		return () => {
			isMounted = false
		}
	}, [enableGNSSHistory, asset, start, end, maxGnssHistoryEntries, history])

	return locationHistory
}
