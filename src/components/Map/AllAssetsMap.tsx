import styles from 'components/Map/AllAssetsMap.module.css'
import { markerIcon } from 'components/Map/MarkerIcon'
import type { Position } from 'components/Map/types'
import { RelativeTime } from 'components/RelativeTime'
import { useAssetLocations } from 'hooks/useAssetLocations'
import type { Map as LeafletMap } from 'leaflet'
import { useState } from 'react'
import { MapContainer, Marker, Popup, TileLayer } from 'react-leaflet'
import { Link } from 'react-router-dom'

export const AllAssetsMap = () => {
	const [map, setmap] = useState<LeafletMap>()
	const positions = useAssetLocations()

	const center: Position = {
		lat: 63.421057567379194,
		lng: 10.43714466087136,
	}

	const zoom = 3

	if (map) {
		map.flyTo(center)
	}

	return (
		<main className={styles.assetsMap}>
			<MapContainer
				center={[center.lat, center.lng]}
				zoom={zoom}
				whenCreated={setmap}
				className={styles.mapContainer}
			>
				<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				{positions.map(({ position, asset, ts }) => (
					<Marker position={position} icon={markerIcon} key={asset.id}>
						<Popup>
							<Link to={`/asset/${asset.id}`}>{asset.name}</Link>
							<br />
							<RelativeTime ts={ts} />
						</Popup>
					</Marker>
				))}
			</MapContainer>
		</main>
	)
}
