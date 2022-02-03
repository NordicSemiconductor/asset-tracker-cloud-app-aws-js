import { icon, Point } from 'leaflet'
import marker from '/marker.svg'

const width = 37.80887
const height = 50.2832
const scaling = 0.7

export const markerIcon = icon({
	iconUrl: marker,
	iconSize: new Point(width * scaling, height * scaling),
	iconAnchor: new Point((width * scaling) / 2, height * scaling - 2),
	popupAnchor: new Point(0, -(height * scaling) + 8),
})
