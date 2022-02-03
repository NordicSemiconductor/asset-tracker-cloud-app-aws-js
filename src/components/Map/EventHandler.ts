import type { LeafletEvent, Map as LeafletMap } from 'leaflet'
import { useMapEvents } from 'react-leaflet'

export const EventHandler = ({
	onZoomEnd,
}: {
	onZoomEnd: (args: { event: LeafletEvent; map: LeafletMap }) => void
}): null => {
	const map = useMapEvents({
		zoomend: (event) => onZoomEnd({ event, map }),
	})
	return null
}
