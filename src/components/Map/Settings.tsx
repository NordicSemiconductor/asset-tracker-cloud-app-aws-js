import { ChartDateRange } from 'components/ChartDateRange/ChartDateRange'
import { useMapSettings } from 'hooks/useMapSettings'
import { SwitchWithNumber } from './SwitchWithNumber'

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

	return (
		<>
			<form className="pt-2 pe-2 ps-2">
				<div className="row ps-1 pe-1">
					<div className="col-sm-6 pt-1 pb-1">
						<div
							className="form-check form-switch"
							data-intro="Whether to always re-center the map on the position of the asset."
						>
							<input
								className="form-check-input"
								type="checkbox"
								name="follow"
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
					<div className="col-sm-6 pt-1 pb-1">
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
				</div>
				<div className="row ps-1 pe-1">
					<div className="col-sm-6 pt-1 pb-1">
						<div
							className="form-check form-switch"
							data-intro="Whether to show the approximate location based on the asset's cell information."
						>
							<input
								className="form-check-input"
								type="checkbox"
								name="singleCellGeoLocation"
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
					<div className="col-sm-6 pt-1 pb-1">
						<div
							className="form-check form-switch"
							data-intro="Whether to show the approximate location based on the asset's neighboring cell information."
						>
							<input
								className="form-check-input"
								type="checkbox"
								name="multiCellGeoLocation"
								onChange={() => {
									updateEnabledLayers({
										neighboringCellGeoLocations:
											!settings.enabledLayers.neighboringCellGeoLocations,
									})
								}}
								checked={settings.enabledLayers.neighboringCellGeoLocations}
								id="mapSettingsMultiCellGeoLocations"
							/>
							<label htmlFor="mapSettingsMultiCellGeoLocations">
								Location based on asset's neighboring cell information
							</label>
						</div>
					</div>
				</div>
				<div className="row ps-1 pe-1 mb-1">
					<SwitchWithNumber
						id="mapSettingsFetchGNSSHistory"
						label="GNSS location history"
						enabled={settings.enabledLayers.gnssHistory}
						onChange={(gnssHistory) =>
							updateEnabledLayers({
								gnssHistory,
							})
						}
						value={settings.maxGnssHistoryEntries}
						updateValue={(maxGnssHistoryEntries) =>
							updateSettings({
								maxGnssHistoryEntries,
							})
						}
					/>
				</div>
				<div className="row ps-1 pe-1 mb-1">
					<SwitchWithNumber
						id="mapSettingsFetchSingleCellHistory"
						label="Single cell location history"
						enabled={settings.enabledLayers.singleCellGeoLocationHistory}
						onChange={(singleCellGeoLocationHistory) =>
							updateEnabledLayers({
								singleCellGeoLocationHistory,
							})
						}
						value={settings.maxSingleCellGeoLocationHistoryEntries}
						updateValue={(maxSingleCellGeoLocationHistoryEntries) =>
							updateSettings({
								maxSingleCellGeoLocationHistoryEntries,
							})
						}
					/>
				</div>
				<div className="row ps-1 pe-1 mb-1">
					<SwitchWithNumber
						id="mapSettingsFetchNeighboringCellHistory"
						label="Neighboring cell location history"
						enabled={settings.enabledLayers.neighboringCellGeoLocationHistory}
						onChange={(neighboringCellGeoLocationHistory) =>
							updateEnabledLayers({
								neighboringCellGeoLocationHistory,
							})
						}
						value={settings.maxNeighboringCellGeoLocationHistoryEntries}
						updateValue={(maxNeighboringCellGeoLocationHistoryEntries) =>
							updateSettings({
								maxNeighboringCellGeoLocationHistoryEntries,
							})
						}
					/>
				</div>
			</form>
			{(settings.enabledLayers.gnssHistory ||
				settings.enabledLayers.singleCellGeoLocationHistory ||
				settings.enabledLayers.neighboringCellGeoLocationHistory) && (
				<div data-intro="This configures the date range for which to fetch historical locations for the asset.">
					<ChartDateRange className="ms-2 me-2 mb-2 mt-2" hideBinControls />
				</div>
			)}
		</>
	)
}
