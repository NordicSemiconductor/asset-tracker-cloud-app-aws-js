import type { Asset } from 'asset/asset.js'
import { SignalQuality } from 'components/Asset/SignalQuality.js'
import { CenterIcon } from 'components/FeatherIcon.js'
import { EventHandler } from 'components/Map/EventHandler.js'
import { HeadingMarker } from 'components/Map/HeadingMarker.js'
import { markerIcon } from 'components/Map/MarkerIcon.js'
import { NoMap } from 'components/Map/NoMap.js'
import styles from 'components/Map/SingleAssetMap.module.css'
import { formatDistanceToNow } from 'date-fns'
import {
	AssetGeoLocationSource,
	useMapData,
	type Position,
} from 'hooks/useMapData.js'
import { useMapSettings } from 'hooks/useMapSettings.js'
import { nanoid } from 'nanoid'
import React from 'react'
import {
	Circle,
	MapContainer,
	Marker,
	Pane,
	Polyline,
	Popup,
	TileLayer,
	useMap,
} from 'react-leaflet'
import { nullOrUndefined } from 'utils/nullOrUndefined.js'
import { toFixed } from 'utils/toFixed.js'

const baseColors = {
	[AssetGeoLocationSource.NetworkSurvey]: '#E56399',
	[AssetGeoLocationSource.SingleCell]: '#F6C270',
	[AssetGeoLocationSource.GNSS]: '#1f56d2',
} as const
const lineColor = `#1f56d2`
const zIndexBySource = {
	[AssetGeoLocationSource.GNSS]: 420,
	[AssetGeoLocationSource.NetworkSurvey]: 410,
	[AssetGeoLocationSource.SingleCell]: 400,
} as const

export const SingleAssetMap = ({ asset }: { asset: Asset }) => {
	const { settings, update: updateSettings } = useMapSettings()
	const { center, locations } = useMapData()

	if (center === undefined) return <NoMap /> // No location data at all to display

	return (
		<div id="asset-map">
			<MapContainer
				center={center.location.position}
				zoom={settings.zoom}
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
					<Popup pane="popupPane">{asset.name}</Popup>
				</Marker>
				{(locations.length ?? 0) > 0 &&
					locations.map(
						(
							{
								location: {
									position: { lat, lng, accuracy, heading, speed },
									batch,
									ts,
									source,
								},
								roaming,
							},
							k,
						) => {
							const alpha = Math.round(
								(1 - k / locations.length) * 255,
							).toString(16)

							const borderColor = `${baseColors[source]}${alpha}`
							const fillColor = baseColors[source]
							const id = nanoid()

							return (
								<React.Fragment key={`${nanoid()}`}>
									<Pane
										name={`assetLocation-${id}`}
										style={{ zIndex: zIndexBySource[source] }}
									>
										{/* outer circle */}
										{!(batch ?? false) && (
											<Circle
												center={{ lat, lng }}
												radius={accuracy}
												color={borderColor}
												fill={false}
											/>
										)}
										{/* red dashed circle to mark batch */}
										{(batch ?? false) && (
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
												color={lineColor}
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
											fillColor={fillColor}
											stroke={false}
											className={`asset-location-circle asset-location-circle-${k}`}
										>
											<Popup position={{ lat, lng }} pane="popupPane">
												<div className={styles.historyInfo}>
													{!nullOrUndefined(accuracy) && (
														<>
															<dt>Accuracy</dt>
															<dd
																data-test={`asset-location-info-${k}-accuracy`}
															>
																{toFixed(accuracy)} m
															</dd>
														</>
													)}
													{!nullOrUndefined(speed) && (
														<>
															<dt>Speed</dt>
															<dd data-test={`asset-location-info-${k}-speed`}>
																{toFixed(speed as number)} m/s
															</dd>
														</>
													)}
													{!nullOrUndefined(heading) && (
														<>
															<dt>Heading</dt>
															<dd
																data-test={`asset-location-info-${k}-heading`}
															>
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
													{(batch ?? false) && (
														<>
															<dt>Batch</dt>
															<dd>Yes</dd>
														</>
													)}
													<dt>Source</dt>
													<dd data-test={`asset-location-info-${k}-source`}>
														{formatSource(source)}
													</dd>
												</div>
												<div className="mt-2">
													<p className="mt-1 mb-1">
														<a
															href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`}
															target="_blank"
															rel="noreferrer"
														>
															View location in Google Maps
														</a>
													</p>
													<p className="mt-1 mb-1">
														<a
															href={`https://www.openstreetmap.org/?mlat=${lat}&mlon=${lng}#map=9/${lat}/${lng}`}
															target="_blank"
															rel="noreferrer"
														>
															View location in OpenStreetMap
														</a>
													</p>
												</div>
												{roaming !== undefined && (
													<div className={`${styles.historyInfo} mt-4`}>
														<dt>Connection</dt>
														<dd
															className="text-end"
															data-test={`asset-roaming-info-${k}-rsrp`}
														>
															<SignalQuality dbm={roaming.v.rsrp} />
														</dd>
														<dt>Network</dt>
														<dt data-test={`asset-roaming-info-${k}-nw`}>
															{roaming.v.nw}
														</dt>
														{roaming.v.band !== undefined && (
															<>
																<dt>Band</dt>
																<dt data-test={`asset-roaming-info-${k}-band`}>
																	{roaming.v.band}
																</dt>
															</>
														)}
														<dt>MCC/MNC</dt>
														<dd data-test={`asset-roaming-info-${k}-mccmnc`}>
															{roaming.v.mccmnc}
														</dd>
														<dt>Area Code</dt>
														<dd data-test={`asset-roaming-info-${k}-area`}>
															{roaming.v.area}
														</dd>
														<dt>Cell ID</dt>
														<dd data-test={`asset-roaming-info-${k}-cell`}>
															{roaming.v.cell}
														</dd>
														{roaming.v.ip !== undefined && (
															<>
																<dt>IP</dt>
																<dd data-test={`asset-roaming-info-${k}-ip`}>
																	{roaming.v.ip}
																</dd>
															</>
														)}
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
				<CenterButton center={center.location.position} />
			</MapContainer>
		</div>
	)
}

const formatSource = (source: AssetGeoLocationSource): string => {
	switch (source) {
		case AssetGeoLocationSource.GNSS:
			return 'GNSS'
		case AssetGeoLocationSource.NetworkSurvey:
			return 'Neighboring cell geo location'
		case AssetGeoLocationSource.SingleCell:
			return 'Single cell geo location'
		default:
			return source
	}
}

const CenterButton = ({ center }: { center: Position }) => {
	const map = useMap()

	return (
		<div className={styles.centerControl}>
			<button
				type="button"
				onClick={() => {
					map?.flyTo(center)
				}}
				title="Center map on asset"
			>
				<CenterIcon />
			</button>
		</div>
	)
}
