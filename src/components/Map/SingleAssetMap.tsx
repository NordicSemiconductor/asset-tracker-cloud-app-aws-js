import type { Asset, AssetHistory, AssetWithTwin, GNSS } from 'asset/asset'
import { SignalQuality } from 'components/Asset/SignalQuality'
import { MenuIcon } from 'components/FeatherIcon'
import { EventHandler } from 'components/Map/EventHandler'
import { markerIcon } from 'components/Map/MarkerIcon'
import { NoMap } from 'components/Map/NoMap'
import styles from 'components/Map/SingleAssetMap.module.css'
import { formatDistanceToNow } from 'date-fns'
import { SensorProperties, useAssetHistory } from 'hooks/useAssetHistory'
import { useChartDateRange } from 'hooks/useChartDateRange'
import type { AssetLocation, Position } from 'hooks/useMapData'
import { useMapData } from 'hooks/useMapData'
import { useMapSettings } from 'hooks/useMapSettings'
import type { Map as LeafletMap } from 'leaflet'
import 'leaflet-fullscreen/dist/leaflet.fullscreen.css'
import 'leaflet-fullscreen/dist/Leaflet.fullscreen.js'
import React, { useState } from 'react'
import Draggable, {
	type DraggableData,
	type DraggableEvent,
} from 'react-draggable'
import {
	Circle,
	MapConsumer,
	MapContainer,
	Marker,
	Polyline,
	Popup,
	TileLayer,
} from 'react-leaflet'
import { nullOrUndefined } from 'utils/nullOrUndefined'
import { toFixed } from 'utils/toFixed'

const HeadingMarker = ({
	heading,
	position,
	mapZoom,
	color,
}: {
	position: Position
	heading: number
	mapZoom: number
	color?: string
}) => (
	<MapConsumer key={mapZoom}>
		{(map) => {
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
		}}
	</MapConsumer>
)

export const SingleAssetMap = ({ asset, twin }: AssetWithTwin) => {
	const { settings } = useMapSettings()
	const { startDate, endDate } = useChartDateRange()
	const enableHistory = settings.enabledLayers.history
	const locationHistory = useAssetHistory({
		sensor: SensorProperties.GNSS,
		startDate,
		endDate,
		enabled: enableHistory,
	})

	const locations: AssetHistory<GNSS> = []

	// If history is disabled, use current position (if available)
	if (!enableHistory && twin.reported.gnss !== undefined)
		locations.push(twin.reported.gnss)

	// If history is enabled, fetch positions according to selected date range
	if (enableHistory) {
		locations.push(...locationHistory)
	}

	const { assetLocations, center } = useMapData({
		locations,
	})

	if (center === undefined) return <NoMap /> // No location data at all to display

	return (
		<div id="asset-map">
			<AssetMap asset={asset} center={center} locations={assetLocations} />
		</div>
	)
}

const AssetMap = ({
	asset,
	center,
	locations,
}: {
	asset: Asset
	center: AssetLocation
	locations: AssetLocation[]
}) => {
	const { settings, update: updateSettings } = useMapSettings()

	const [map, setmap] = useState<LeafletMap>()
	if (map !== undefined && settings.follow) {
		map.flyTo(center.location.position, settings.zoom)
	}
	const [initPosition, setInitPosition] = useState(0)
	const [initSize, setInitSize] = useState(0)

	const initial = (data: DraggableData) => {
		//Gets the initial position and size of the map container.
		const map = document.getElementById('map-container')
		setInitPosition(data.lastY)
		setInitSize(map!.offsetHeight)
	}
	const resize = (data: DraggableData) => {
		//Gets the final position of the map container and resizes it.
		const map = document.getElementById('map-container')
		console.log(`map height(before): ${map!.style.height}`)
		map!.style.height = `${initSize + (data.y - initPosition)}px`

		console.log(`init Size: ${initSize}`)
		console.log(`init Position: ${initPosition}`)
		console.log(`data.lastY: ${data.lastY}`)
		console.log(`data.y: ${data.y}`)
		console.log(`data.deltaY: ${data.deltaY}`)
		console.log(`data.lastX: ${data.lastX}`)
		console.log(`data.x: ${data.x}`)
		console.log(`data.deltaX: ${data.deltaX}`)
		console.log(`map height(after): ${map!.style.height}`)
		console.log(`-----------------------------`)
	}

	const setMap = (map: LeafletMap) => {
		setmap(map)
		const resizeObserver = new ResizeObserver(() => {
			map.invalidateSize()
		})
		const container = document.getElementById('map-container')
		resizeObserver.observe(container!)
	}

	return (
		<div>
			<MapContainer
				id="map-container"
				center={center.location.position}
				zoom={settings.zoom}
				fullscreenControl={true}
				whenCreated={setMap}
				className={styles.mapContainer}
			>
				<EventHandler
					onZoomEnd={({ map }) => {
						updateSettings({ zoom: map.getZoom() })
					}}
				/>
				<TileLayer
					attribution='&amp;copy <a href="http://osm.org/copyright">OpenStreetMap</a> contributors'
					url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
				/>
				<Marker position={center.location.position} icon={markerIcon}>
					<Popup>{asset.name}</Popup>
				</Marker>
				{(locations.length ?? 0) > 0 &&
					locations.map(
						(
							{
								location: {
									position: { lat, lng, accuracy, heading, speed },
									batch,
									ts,
								},
								roaming,
							},
							k,
						) => {
							const alpha = Math.round(
								(1 - k / locations.length) * 255,
							).toString(16)
							const color = `#1f56d2${alpha}`

							return (
								<React.Fragment key={`history-${k}`}>
									{/* outer circle */}
									{!batch && (
										<Circle
											center={{ lat, lng }}
											radius={accuracy}
											color={color}
										/>
									)}
									{/* red dashed circle to mark batch */}
									{batch && (
										<Circle
											center={{ lat, lng }}
											radius={accuracy}
											stroke={true}
											color={'#ff0000'}
											weight={2}
											fill={false}
											dashArray={settings.zoom > 16 ? '3 6' : '6 12'}
										/>
									)}
									{k > 0 && (
										<Polyline
											positions={[
												locations[k - 1].location.position,
												{ lat, lng },
											]}
											weight={settings.zoom > 16 ? 1 : 2}
											lineCap={'round'}
											color={color}
											dashArray={'10'}
										/>
									)}
									{heading !== undefined && settings.enabledLayers.headings && (
										<HeadingMarker
											position={{ lat, lng }}
											heading={heading}
											mapZoom={settings.zoom}
											color={'#00000080'}
										/>
									)}
									{/* background circle */}
									<Circle
										center={{ lat, lng }}
										radius={accuracy}
										fillColor={'#826717'}
										stroke={false}
										className={`asset-location-circle asset-location-circle-${k}`}
									>
										<Popup position={{ lat, lng }}>
											<div className={styles.historyInfo}>
												{!nullOrUndefined(accuracy) && (
													<>
														<dt>Accuracy</dt>
														<dd data-test="asset-location-info-accuracy">
															{toFixed(accuracy as number)} m
														</dd>
													</>
												)}
												{!nullOrUndefined(speed) && (
													<>
														<dt>Speed</dt>
														<dd data-test="asset-location-info-speed">
															{toFixed(speed as number)} m/s
														</dd>
													</>
												)}
												{!nullOrUndefined(heading) && (
													<>
														<dt>Heading</dt>
														<dd data-test="asset-location-info-heading">
															{toFixed(heading as number)}°
														</dd>
													</>
												)}
												<dt>Time</dt>
												<dd>
													<time dateTime={new Date(ts).toISOString()}>
														{formatDistanceToNow(ts, {
															includeSeconds: true,
															addSuffix: true,
														})}
													</time>
												</dd>
												{batch && (
													<>
														<dt>Batch</dt>
														<dd>Yes</dd>
													</>
												)}
											</div>
											{roaming !== undefined && !batch && (
												<>
													<div className={styles.historyInfo}>
														<dt>Connection</dt>
														<dd style={{ textAlign: 'right' }}>
															<SignalQuality dbm={roaming.roaming.rsrp} />
														</dd>
														<dt>MCC/MNC</dt>
														<dd>{roaming.roaming.mccmnc}</dd>
														<dt>Area Code</dt>
														<dd>{roaming.roaming.area}</dd>
														<dt>Cell ID</dt>
														<dd>{roaming.roaming.cell}</dd>
														<dt>IP</dt>
														<dd>{roaming.roaming.ip}</dd>
														<dt>RSRP</dt>
														<dd>{roaming.roaming.rsrp}</dd>
														<dt>Time</dt>
														<dd>
															<time
																dateTime={new Date(roaming.ts).toISOString()}
															>
																{formatDistanceToNow(roaming.ts, {
																	includeSeconds: true,
																	addSuffix: true,
																})}
															</time>
														</dd>
													</div>
												</>
											)}
										</Popup>
									</Circle>
								</React.Fragment>
							)
						},
					)}
			</MapContainer>
			<Draggable
				axis="y"
				scale={1}
				onStart={(e: DraggableEvent, data: DraggableData) => initial(data)}
				onDrag={(e: DraggableEvent, data: DraggableData) => resize(data)}
				position={{ x: 0, y: 0 }}
				positionOffset={{ x: 'parent', y: 'parent' }}
			>
				<button
					id="map-container-resize"
					className={styles.resizeMapButton}
					data-test="resize-map-button"
				>
					<MenuIcon className={styles.menu} />
				</button>
			</Draggable>
		</div>
	)
}
