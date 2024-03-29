import { ChartDateRange } from 'components/ChartDateRange/ChartDateRange.js'
import styles from 'components/Map/AllAssetsMap.module.css'
import { markerIcon } from 'components/Map/MarkerIcon.js'
import { RelativeTime } from 'components/RelativeTime.js'
import { useAssetLocations } from 'hooks/useAssetLocations.js'
import { useChartDateRange } from 'hooks/useChartDateRange.js'
import type { Position } from 'hooks/useMapData.js'
import { useMemo } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { Link } from 'react-router-dom'

export const AllAssetsMap = () => {
	const positions = useAssetLocations()
	const {
		range: { start: startDate, end: endDate },
	} = useChartDateRange()

	const center: Position = useMemo(
		() => ({
			lat: 63.421057567379194,
			lng: 10.43714466087136,
			accuracy: 50,
		}),
		[],
	)

	const zoom = 3

	const positionsWithRecentGNSS = positions.filter(
		({ ts }) =>
			ts.getTime() >= startDate.getTime() && ts.getTime() <= endDate.getTime(),
	)

	return (
		<main className={styles.assetsMap} id="all-assets-map">
			<MapContainer
				center={[center.lat, center.lng]}
				zoom={zoom}
				className={styles.mapContainer}
			>
				<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{positionsWithRecentGNSS.map(({ position, asset, ts }) => (
					<Marker position={position} icon={markerIcon} key={asset.id}>
						<Popup>
							<Link to={`/asset/${asset.id}`}>{asset.name}</Link>
							<br />
							<RelativeTime ts={ts} />
						</Popup>
					</Marker>
				))}
				<div className={styles.dateRangeControl}>
					<ChartDateRange hideBinControls noBorder />
				</div>
			</MapContainer>
		</main>
	)
}
