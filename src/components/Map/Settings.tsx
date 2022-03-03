import { ChartDateRange } from 'components/ChartDateRange/ChartDateRange'
import styles from 'components/Map/Settings.module.css'
import { SwitchWithNumber } from 'components/Map/SwitchWithNumber'
import { useMapSettings } from 'hooks/useMapSettings'

export const MapSettings = () => {
	const { settings, update: updateSettings } = useMapSettings()

	const updateEnabledLayers = (
		update: Partial<typeof settings['enabledLayers']>,
	) => {
		const newState: typeof settings = {
			...settings,
			enabledLayers: {
				...settings.enabledLayers,
				...update,
			},
		}
		updateSettings(newState)
	}

	const updateHistory = (update: Partial<typeof settings['history']>) => {
		const newState: typeof settings = {
			...settings,
			history: {
				...settings.history,
				...update,
			},
		}
		updateSettings(newState)
	}

	return (
		<div className={styles.settings}>
			<form>
				<div>
					<div
						className="form-check form-switch"
						data-intro="Whether to always re-center the map on the position of the asset."
					>
						<input
							className="form-check-input"
							type="checkbox"
							name="mapSettingsFollow"
							onChange={() => {
								const newSettings = {
									...settings,
									follow: !settings.follow,
								}
								updateSettings(newSettings)
							}}
							checked={settings.follow}
							id="mapSettingsFollow"
						/>
						<label htmlFor="mapSettingsFollow">Re-center on position</label>
					</div>
				</div>
				<div>
					<div
						className="form-check form-switch"
						data-intro="Whether to show the heading (direction) information with locations."
					>
						<input
							className="form-check-input"
							type="checkbox"
							name="headings"
							onChange={() => {
								updateEnabledLayers({
									headings: !settings.enabledLayers.headings,
								})
							}}
							checked={settings.enabledLayers.headings}
							id="mapSettingsHeadings"
						/>
						<label htmlFor="mapSettingsHeadings">Headingmarker</label>
					</div>
				</div>
				<div className="row">
					<SwitchWithNumber
						id="mapSettingsFetchGNSSHistory"
						label="GNSS location history"
						checked={settings.history.gnss}
						onChange={(gnss) =>
							updateHistory({
								gnss,
							})
						}
						value={settings.history.maxGnssEntries}
						updateValue={(maxGnssEntries) =>
							updateHistory({
								maxGnssEntries,
							})
						}
					/>
				</div>
				<div>
					<div
						className="form-check form-switch"
						data-intro="Whether to show the approximate location based on the asset's cell information."
					>
						<input
							className="form-check-input"
							type="checkbox"
							name="mapSettingsSingleCellGeoLocations"
							onChange={() => {
								updateEnabledLayers({
									singleCellGeoLocations:
										!settings.enabledLayers.singleCellGeoLocations,
								})
							}}
							checked={settings.enabledLayers.singleCellGeoLocations}
							id="mapSettingsSingleCellGeoLocations"
						/>
						<label htmlFor="mapSettingsSingleCellGeoLocations">
							Location based on asset's cell information
						</label>
					</div>
				</div>
				<div className="row">
					<SwitchWithNumber
						id="mapSettingsFetchSingleCellHistory"
						label="Single cell location history"
						disabled={!settings.enabledLayers.singleCellGeoLocations}
						checked={settings.history.singleCell}
						onChange={(singleCell) =>
							updateHistory({
								singleCell,
							})
						}
						value={settings.history.maxSingleCellGeoLocationEntries}
						updateValue={(maxSingleCellGeoLocationEntries) =>
							updateHistory({
								maxSingleCellGeoLocationEntries,
							})
						}
					/>
				</div>
				<div>
					<div
						className="form-check form-switch"
						data-intro="Whether to show the approximate location based on the asset's neighboring cell information."
					>
						<input
							className="form-check-input"
							type="checkbox"
							name="mapSettingsNeighboringCellGeoLocations"
							onChange={() => {
								updateEnabledLayers({
									neighboringCellGeoLocations:
										!settings.enabledLayers.neighboringCellGeoLocations,
								})
							}}
							checked={settings.enabledLayers.neighboringCellGeoLocations}
							id="mapSettingsNeighboringCellGeoLocations"
						/>
						<label htmlFor="mapSettingsNeighboringCellGeoLocations">
							Location based on asset's neighboring cell information
						</label>
					</div>
				</div>
				<div className="row">
					<SwitchWithNumber
						id="mapSettingsFetchNeighboringCellHistory"
						label="Neighboring cell location history"
						disabled={!settings.enabledLayers.neighboringCellGeoLocations}
						checked={settings.history.neighboringCell}
						onChange={(neighboringCell) =>
							updateHistory({
								neighboringCell,
							})
						}
						value={settings.history.maxNeighboringCellGeoLocationEntries}
						updateValue={(maxNeighboringCellGeoLocationEntries) =>
							updateHistory({
								maxNeighboringCellGeoLocationEntries,
							})
						}
					/>
				</div>
			</form>
			<div data-intro="This configures the date range for which to fetch historical locations for the asset.">
				<ChartDateRange hideBinControls />
			</div>
		</div>
	)
}
