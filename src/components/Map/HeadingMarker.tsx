import type { Position } from 'hooks/useMapData.js'
import { Polyline, useMap } from 'react-leaflet'

export const HeadingMarker = ({
	heading,
	position,
	mapZoom,
	color,
}: {
	position: Pick<Position, 'lat' | 'lng'>
	heading: number
	mapZoom: number
	color?: string
}) => {
	const map = useMap()
	const { x, y } = map.project(position, mapZoom)
	const endpoint = map.unproject(
		[
			x + mapZoom * 3 * Math.cos((((heading - 90) % 360) * Math.PI) / 180),
			y + mapZoom * 3 * Math.sin((((heading - 90) % 360) * Math.PI) / 180),
		],
		mapZoom,
	)
	return (
		<Polyline
			positions={[position, endpoint]}
			weight={mapZoom > 16 ? 1 : 2}
			lineCap={'round'}
			color={color ?? '#000000'}
		/>
	)
}
