import type { Static } from '@sinclair/typebox'
import type { Asset, AssetWithTwin, GNSS } from 'asset/asset'
import { SignalQuality } from 'components/Asset/SignalQuality'
import { EventHandler } from 'components/Map/EventHandler'
import { markerIcon } from 'components/Map/MarkerIcon'
import { NoMap } from 'components/Map/NoMap'
import styles from 'components/Map/SingleAssetMap.module.css'
import { formatDistanceToNow } from 'date-fns'
import { useCellGeoLocation } from 'hooks/useCellGeoLocation'
import type {
	AssetGeoLocation,
	CellGeoLocation,
	GeoLocation,
	Position,
} from 'hooks/useMapData'
import { useMapData } from 'hooks/useMapData'
import { useMapSettings } from 'hooks/useMapSettings'
import { useNeighboringCellMeasurementReportGeoLocation } from 'hooks/useNeighboringCellMeasurementReportGeoLocation'
import type { Map as LeafletMap } from 'leaflet'
import React, { useState } from 'react'
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

const toLocation = (gnss: Static<typeof GNSS>): GeoLocation => ({
	position: {
		lat: gnss.v.lat,
		lng: gnss.v.lng,
		accuracy: gnss.v.acc,
		altitude: gnss.v.alt,
		heading: gnss.v.hdg,
		speed: gnss.v.spd,
	},
	ts: new Date(gnss.ts),
	batch: false,
})

export const SingleAssetMap = ({ asset, twin }: AssetWithTwin) => {
	const { settings } = useMapSettings()
	const { location: neighboringCellGeoLocation } =
		useNeighboringCellMeasurementReportGeoLocation()
	const { location: cellGeoLocation } = useCellGeoLocation()
	const enableHistory = settings.enabledLayers.history

	const locations: GeoLocation[] = []

	// If history is disabled, use current position (if available)
	if (!enableHistory && twin.reported.gnss !== undefined)
		locations.push(toLocation(twin.reported.gnss))

	// If history is enabled, fetch positions according to selected date range
	/*
	const locationHistory = []
	useAssetHistory({
		sensor: SensorProperties.GNSS,
		disabled: !enableHistory,
	})
	if (enableHistory) {
		locations.push(...locationHistory.map(toLocation))
	}
	*/

	const { assetLocations, center } = useMapData({
		locations,
	})

	if (center === undefined) return <NoMap /> // No location data at all to display

	return (
		<div id="asset-map">
			<AssetMap
				asset={asset}
				center={center}
				locations={assetLocations}
				neighboringCellGeoLocation={neighboringCellGeoLocation}
				cellGeoLocation={cellGeoLocation}
			/>
		</div>
	)
}

const AssetMap = ({
	asset,
	center,
	locations,
	cellGeoLocation,
	neighboringCellGeoLocation,
}: {
	asset: Asset
	center: AssetGeoLocation
	locations: AssetGeoLocation[]
	cellGeoLocation?: CellGeoLocation
	neighboringCellGeoLocation?: CellGeoLocation
}) => {
	const { settings, update: updateSettings } = useMapSettings()

	const [map, setmap] = useState<LeafletMap>()
	if (map !== undefined && settings.follow) {
		map.flyTo(center.location.position, settings.zoom)
	}
	return (
		<MapContainer
			center={center.location.position}
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
						const alpha = Math.round((1 - k / locations.length) * 255).toString(
							16,
						)
						const color = `#1f56d2${alpha}`

						return (
							<React.Fragment key={`history-${k}`}>
								<Marker position={center.location.position} icon={markerIcon}>
									<Popup pane="popupPane">{asset.name}</Popup>
								</Marker>
								{/* Cell Geolocation */}
								<Pane name="cellGeolocation" style={{ zIndex: 400 }}>
									{cellGeoLocation &&
										settings.enabledLayers.singleCellGeoLocations && (
											<Circle
												center={cellGeoLocation.position}
												radius={cellGeoLocation.position.accuracy}
												color={'#F6C270'}
											>
												<Popup pane="popupPane">
													Approximate location based on asset's cell
													information.
												</Popup>
											</Circle>
										)}
								</Pane>
								{/* Neighboring Cell Geolocation */}
								<Pane name="neighboringCellGeoLocation" style={{ zIndex: 410 }}>
									{neighboringCellGeoLocation &&
										settings.enabledLayers.multiCellGeoLocations && (
											<Circle
												center={neighboringCellGeoLocation.position}
												radius={neighboringCellGeoLocation.position.accuracy}
												color={'#E56399'}
											>
												<Popup pane="popupPane">
													Approximate location based on neighboring cell
													information.
												</Popup>
											</Circle>
										)}
								</Pane>
								<Pane name="assetLocation" style={{ zIndex: 420 }}>
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
								</Pane>
							</React.Fragment>
						)
					},
				)}
		</MapContainer>
	)
}
