import type { Asset } from 'asset/asset'
import { SignalQuality } from 'components/Asset/SignalQuality'
import { CenterIcon } from 'components/FeatherIcon'
import { EventHandler } from 'components/Map/EventHandler'
import { markerIcon } from 'components/Map/MarkerIcon'
import { NoMap } from 'components/Map/NoMap'
import styles from 'components/Map/SingleAssetMap.module.css'
import { formatDistanceToNow } from 'date-fns'
import { Position, useMapData } from 'hooks/useMapData'
import { useMapSettings } from 'hooks/useMapSettings'
import type { Map as LeafletMap } from 'leaflet'
import { nanoid } from 'nanoid'
import React, { useEffect, useState } from 'react'
import {
	Circle,
	MapConsumer,
	MapContainer,
	Marker,
	Pane,
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

export const SingleAssetMap = ({ asset }: { asset: Asset }) => {
	const { settings, update: updateSettings } = useMapSettings()
	const { center, locations, neighboringCellGeoLocation, cellGeoLocation } =
		useMapData()
	const [map, setmap] = useState<LeafletMap>()

	// Zoom to center
	const { follow } = settings
	const centerPosition = center?.position
	useEffect(() => {
		if (map === undefined) return
		if (centerPosition === undefined) return
		if (!follow) return

		// Wait a little before moving the map, otherwise Leaflet will act
		// up while it's trying to zoom/center and markers are being re-rendered.
		const centerTimeout = setTimeout(() => {
			map.flyTo(centerPosition)
		}, 500)

		return () => {
			clearTimeout(centerTimeout)
		}
	}, [map, centerPosition, follow])

	if (center === undefined) return <NoMap /> // No location data at all to display

	return (
		<div id="asset-map">
			<MapContainer
				center={center.position}
				zoom={settings.zoom}
				whenCreated={setmap}
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
				<Marker position={center.position} icon={markerIcon}>
					<Popup pane="popupPane">{asset.name}</Popup>
				</Marker>
				{/* Cell Geolocation */}
				<Pane name={`cellGeolocation`} style={{ zIndex: 400 }}>
					{cellGeoLocation && settings.enabledLayers.singleCellGeoLocations && (
						<Circle
							center={cellGeoLocation.position}
							radius={cellGeoLocation.position.accuracy}
							color={'#F6C270'}
						>
							<Popup pane="popupPane">
								Approximate location based on asset's cell information.
							</Popup>
						</Circle>
					)}
				</Pane>
				{/* Neighboring Cell Geolocation */}
				<Pane name={`neighboringCellGeoLocation`} style={{ zIndex: 410 }}>
					{neighboringCellGeoLocation &&
						settings.enabledLayers.multiCellGeoLocations && (
							<Circle
								center={neighboringCellGeoLocation.position}
								radius={neighboringCellGeoLocation.position.accuracy}
								color={'#E56399'}
							>
								<Popup pane="popupPane">
									Approximate location based on neighboring cell information.
								</Popup>
							</Circle>
						)}
				</Pane>
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
							const id = nanoid()

							return (
								<React.Fragment key={`history-${k}`}>
									<Pane name={`assetLocation-${id}`} style={{ zIndex: 420 }}>
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
												dashArray={'3 6'}
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
										{heading !== undefined &&
											settings.enabledLayers.headings && (
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
											<Popup position={{ lat, lng }} pane="popupPane">
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
												{roaming !== undefined && (
													<div className={`${styles.historyInfo} mt-4`}>
														<dt>Connection</dt>
														<dd
															className="text-end"
															data-test="asset-roaming-info-rsrp"
														>
															<SignalQuality dbm={roaming.v.rsrp} />
														</dd>
														<dt>Network</dt>
														<dt data-test="asset-roaming-info-nw">
															{roaming.v.nw}
														</dt>
														<dt>Band</dt>
														<dt data-test="asset-roaming-info-band">
															{roaming.v.band}
														</dt>
														<dt>MCC/MNC</dt>
														<dd data-test="asset-roaming-info-mccmnc">
															{roaming.v.mccmnc}
														</dd>
														<dt>Area Code</dt>
														<dd data-test="asset-roaming-info-area">
															{roaming.v.area}
														</dd>
														<dt>Cell ID</dt>
														<dd data-test="asset-roaming-info-cell">
															{roaming.v.cell}
														</dd>
														<dt>IP</dt>
														<dd data-test="asset-roaming-info-ip">
															{roaming.v.ip}
														</dd>
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
												)}
											</Popup>
										</Circle>
									</Pane>
								</React.Fragment>
							)
						},
					)}
				<div className={styles.centerControl}>
					<button
						type="button"
						onClick={() => {
							map?.flyTo(center.position)
						}}
						title="Center map on asset"
					>
						<CenterIcon />
					</button>
				</div>
			</MapContainer>
		</div>
	)
}
