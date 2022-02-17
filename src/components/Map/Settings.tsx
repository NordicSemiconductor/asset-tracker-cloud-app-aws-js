import cx from 'classnames'
import { ChartDateRange } from 'components/ChartDateRange'
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
										multiCellGeoLocations:
											!settings.enabledLayers.multiCellGeoLocations,
									})
								}}
								checked={settings.enabledLayers.multiCellGeoLocations}
								id="mapSettingsMultiCellGeoLocations"
							/>
							<label htmlFor="mapSettingsMultiCellGeoLocations">
								Location based on asset's neighboring cell information
							</label>
						</div>
					</div>
				</div>
				<div
					className={cx('row ps-1 pe-1', {
						'mb-2': !settings.enabledLayers.history,
					})}
				>
					<div className="col-sm-6 d-flex">
						<div
							className="form-check form-switch"
							data-intro="Whether to show location history of the asset."
						>
							<input
								className="form-check-input"
								type="checkbox"
								name="fetchHistoricalData"
								onChange={() => {
									updateEnabledLayers({
										history: !settings.enabledLayers.history,
									})
								}}
								checked={settings.enabledLayers.history}
								id="mapSettingsFetchHistory"
							/>
							<label htmlFor="mapSettingsFetchHistory" className="text-nowrap">
								Fetch history
							</label>
						</div>
					</div>
					{settings.enabledLayers.history && (
						<div className="col-sm-6">
							<div className="input-group input-group-sm ">
								<input
									type="number"
									className="form-control"
									value={settings.numHistoryEntries ?? '10'}
									min={1}
									step={1}
									onChange={({ target: { value } }) => {
										updateSettings({ numHistoryEntries: parseInt(value, 10) })
									}}
								/>
								<span className="input-group-text">entries</span>
							</div>
						</div>
					)}
				</div>
			</form>
			{settings.enabledLayers.history && (
				<div data-intro="This configures the date range for which to fetch historical locations for the asset.">
					<ChartDateRange className="ms-2 me-2 mb-2" hideBinControls />
				</div>
			)}
		</>
	)
}
