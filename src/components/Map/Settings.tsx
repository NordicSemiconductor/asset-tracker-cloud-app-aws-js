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
						<div className="form-check form-switch">
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
						<div className="form-check form-switch">
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
						<div className="form-check form-switch">
							<input
								className="form-check-input"
								type="checkbox"
								name="singlecellLocation"
								onChange={() => {
									updateEnabledLayers({
										singlecellLocations:
											!settings.enabledLayers.singlecellLocations,
									})
								}}
								checked={settings.enabledLayers.singlecellLocations}
								id="mapSettingsSingleCellLocations"
							/>
							<label htmlFor="mapSettingsSingleCellLocations">
								Singlecell locations
							</label>
						</div>
					</div>
					<div className="col-sm-6 d-flex">
						<div className="form-check form-switch flex-grow-1">
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
				</div>
				<div className="row ps-1 pe-1">
					<div className="col-sm-6 pt-1 pb-1">
						<div className="form-check form-switch">
							<input
								className="form-check-input"
								type="checkbox"
								name="multicellLocation"
								onChange={() => {
									updateEnabledLayers({
										multicellLocations:
											!settings.enabledLayers.multicellLocations,
									})
								}}
								checked={settings.enabledLayers.multicellLocations}
								id="mapSettingsMultiCellLocations"
							/>
							<label htmlFor="mapSettingsMultiCellLocations">
								Multicell locations
							</label>
						</div>
					</div>
				</div>
			</form>
			<ChartDateRange />
		</>
	)
}
