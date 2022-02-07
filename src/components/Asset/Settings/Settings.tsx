import type { AssetConfig } from 'asset/asset'
import { DataModules } from 'asset/asset'
import { defaultConfig } from 'asset/defaultConfig'
import cx from 'classnames'
import { NumberConfigSetting } from 'components/Asset/Settings/NumberConfigSetting'
import { OutDatedWarning } from 'components/Asset/Settings/OutDatedWarning'
import styles from 'components/Asset/Settings/Settings.module.css'
import { OutdatedConfigValueIcon, UnknownIcon } from 'components/FeatherIcon'
import { NoData } from 'components/NoData'
import equal from 'fast-deep-equal'
import { useAsset } from 'hooks/useAsset'
import { useEffect, useState } from 'react'

const MAX_INT32 = 2147483647

const buttonClass = (
	color: 'info' | 'success' | 'danger',
	outline: boolean,
): string =>
	cx('btn', {
		[`btn-${color}`]: !outline,
		[`btn-outline-${color}`]: outline,
	})

export const Settings = () => {
	const { twin } = useAsset()

	const [currentDesiredConfig, setCurrentDesiredConfig] =
		useState<AssetConfig>()

	useEffect(() => {
		if (twin === undefined) return
		setCurrentDesiredConfig({
			...defaultConfig,
			...twin.desired.cfg,
		})
	}, [setCurrentDesiredConfig, twin])
	if (currentDesiredConfig === undefined) return <NoData />
	return <SettingsUI currentDesiredConfig={currentDesiredConfig} />
}

const SettingsUI = ({
	currentDesiredConfig,
}: {
	currentDesiredConfig: AssetConfig
}) => {
	const { update, twin } = useAsset()

	console.log({ twin })

	const {
		reported: { cfg: reportedConfig },
	} = twin ?? { reported: { cfg: {} as Partial<AssetConfig> } }
	const [newDesiredConfig, setNewDesiredConfig] =
		useState<Partial<AssetConfig>>(currentDesiredConfig)

	const hasChanges = !equal(newDesiredConfig, currentDesiredConfig)

	const updateConfig = (cfg: Partial<AssetConfig>) => {
		const updated = {
			...newDesiredConfig,
			...cfg,
		}
		setNewDesiredConfig(updated)
	}

	const updateConfigProperty =
		(property: string, parser?: (v: string) => number) => (value: string) => {
			updateConfig({
				[property]: parser !== undefined ? parser(value) : parseInt(value, 10),
			})
		}

	const isActive =
		newDesiredConfig.act !== undefined
			? newDesiredConfig.act === true
			: reportedConfig?.act === true

	return (
		<form className={styles.SettingsForm} id="asset-settings-form">
			<fieldset data-intro={'This sets the operation mode of the asset.'}>
				<legend>Mode</legend>
				<div className="input-group mb-2">
					<div className="btn-group" role="group">
						<OutDatedWarning
							desired={newDesiredConfig.act}
							reported={reportedConfig?.act}
							onNotReported={
								<button
									type="button"
									className={
										'btn btn-danger d-flex justify-content-center align-items-center'
									}
									disabled={true}
									title={'Asset has not reported this setting, yet.'}
								>
									<UnknownIcon />
								</button>
							}
							onOutDated={(current) => (
								<button
									type="button"
									className={
										'btn btn-outline-danger d-flex justify-content-center align-items-center'
									}
									disabled={true}
									title={`Asset has an outdated value. Current value: ${JSON.stringify(
										current,
									)}.`}
								>
									<OutdatedConfigValueIcon />
								</button>
							)}
						/>
						<button
							type="button"
							className={buttonClass('info', isActive)}
							data-intro={
								'In <em>Passive</em> mode, the asset will wait for movement (triggered by the accelerometer) before sending an update to the cloud.'
							}
							onClick={() => {
								updateConfig({ act: false })
							}}
							id="passive-mode"
						>
							Passive
						</button>
						<button
							type="button"
							className={buttonClass('success', !isActive)}
							data-intro={
								'In <em>Active</em> mode, the asset will send an update in a configurable interval.'
							}
							onClick={() => {
								updateConfig({ act: true })
							}}
							id="active-mode"
						>
							Active
						</button>
					</div>
				</div>
			</fieldset>
			<fieldset data-intro={'How long to try to acquire a GNSS fix.'}>
				<legend>GNSS Timeout</legend>
				<NumberConfigSetting
					id={'gnsst'}
					desired={newDesiredConfig.gnsst}
					reported={reportedConfig?.gnsst}
					example={60}
					onChange={updateConfigProperty('gnsst')}
					minimum={1}
					maximum={MAX_INT32}
				/>
			</fieldset>
			<fieldset
				data-intro={'This configures the <em>passive</em> mode.'}
				style={{ gridRowEnd: 'span 2' }}
			>
				<legend>Passive Mode Settings</legend>
				<div className={styles.SideBySide}>
					<NumberConfigSetting
						label={'Movement Resolution'}
						intro={
							'After detecting movement send an update and wait this amount of time until movement again can trigger the next update.'
						}
						id={'mvres'}
						desired={newDesiredConfig.mvres}
						reported={reportedConfig?.mvres}
						onChange={updateConfigProperty('mvres')}
						minimum={1}
						maximum={MAX_INT32}
						example={300}
					/>
					<NumberConfigSetting
						label={'Movement Timeout'}
						intro={'Send updates to the cloud at least this often.'}
						id={'mvt'}
						example={3600}
						desired={newDesiredConfig.mvt}
						reported={reportedConfig?.mvt}
						onChange={updateConfigProperty('mvt')}
						minimum={1}
						maximum={MAX_INT32}
					/>
				</div>
				<NumberConfigSetting
					label={'Accelerometer threshold'}
					intro={
						'Minimal absolute value for an accelerometer reading to be considered movement. Range: 0 to 19.6133 m/s².'
					}
					id={'acct'}
					example={0.1}
					step={0.1}
					minimum={0}
					maximum={19.6133}
					unit={'m/s²'}
					desired={newDesiredConfig.acct}
					reported={reportedConfig?.acct}
					onChange={updateConfigProperty('acct', parseFloat)}
				/>
			</fieldset>
			<fieldset data-intro={'This configures the <em>active</em> mode.'}>
				<legend>Active Mode Settings</legend>
				<NumberConfigSetting
					label={'Active Wait Time'}
					intro={
						'Wait this amount of seconds until sending the next update. The actual interval will be this time plus the time it takes to get a GNSS fix.'
					}
					id={'actwt'}
					desired={newDesiredConfig.actwt}
					reported={reportedConfig?.actwt}
					onChange={updateConfigProperty('actwt')}
					minimum={1}
					maximum={MAX_INT32}
					example={60}
				/>
			</fieldset>
			<fieldset data-intro={'This sets which Data Modules to sample.'}>
				<legend>Data Sampling</legend>
				<div className="input-group mb-2">
					<label className="form-label" htmlFor="nod-gnss">
						GNSS:
					</label>
					<div className="btn-group" role="group">
						<OutDatedWarning
							desired={newDesiredConfig.nod}
							reported={reportedConfig?.nod}
							onNotReported={
								<button
									type="button"
									className={
										'btn btn-danger d-flex justify-content-center align-items-center'
									}
									disabled={true}
									title={'Asset has not reported this setting, yet.'}
									id="nod-gnss"
								>
									<UnknownIcon />
								</button>
							}
							onOutDated={(current) => (
								<button
									type="button"
									className={
										'btn btn-outline-danger d-flex justify-content-center align-items-center'
									}
									disabled={true}
									title={`Asset has an outdated value. Current value: ${JSON.stringify(
										current,
									)}.`}
								>
									<OutdatedConfigValueIcon />
								</button>
							)}
							isEqual={(desired, reported) => {
								const ncellEnabled = desired.includes(DataModules.GNSS)
								return reported.includes(DataModules.GNSS) === ncellEnabled
							}}
						/>
						<button
							type="button"
							className={buttonClass(
								'success',
								newDesiredConfig.nod?.includes(DataModules.GNSS) ?? false,
							)}
							data-intro={
								'In <em>Enabled</em> mode, the asset will use GNSS to send location data to the cloud.'
							}
							onClick={() => {
								updateConfig({
									nod: [...(newDesiredConfig.nod ?? [])].filter(
										(s) => s !== DataModules.GNSS,
									),
								})
							}}
							id="gnss-enable"
						>
							Enabled
						</button>
						<button
							type="button"
							className={buttonClass(
								'danger',
								newDesiredConfig.nod === undefined ||
									!newDesiredConfig.nod?.includes(DataModules.GNSS),
							)}
							data-intro={
								'In <em>Disabled</em> mode, the asset will not use GNSS to send location data to the cloud.'
							}
							onClick={() => {
								updateConfig({
									nod: [
										...new Set([
											...(newDesiredConfig.nod ?? []),
											DataModules.GNSS,
										]),
									],
								})
							}}
							id="gnss-disable"
						>
							Disabled
						</button>
					</div>
				</div>
				<div className="input-group mb-2">
					<label className="form-label" htmlFor="nod-ncell">
						Neighbor Cell Measurements:
					</label>
					<div className="btn-group" role="group">
						<OutDatedWarning
							desired={newDesiredConfig.nod}
							reported={reportedConfig?.nod}
							onNotReported={
								<button
									type="button"
									className={
										'btn btn-danger d-flex justify-content-center align-items-center'
									}
									disabled={true}
									title={'Asset has not reported this setting, yet.'}
									id="nod-ncell"
								>
									<UnknownIcon />
								</button>
							}
							onOutDated={(current) => (
								<button
									type="button"
									className={
										'btn btn-outline-danger d-flex justify-content-center align-items-center'
									}
									disabled={true}
									title={`Asset has an outdated value. Current value: ${JSON.stringify(
										current,
									)}.`}
								>
									<OutdatedConfigValueIcon />
								</button>
							)}
							isEqual={(desired, reported) => {
								const ncellEnabled = desired.includes(
									DataModules.NeigboringCellMeasurements,
								)
								return (
									reported.includes(DataModules.NeigboringCellMeasurements) ===
									ncellEnabled
								)
							}}
						/>
						<button
							type="button"
							className={buttonClass(
								'success',
								newDesiredConfig.nod?.includes(
									DataModules.NeigboringCellMeasurements,
								) ?? false,
							)}
							data-intro={
								'In <em>Enabled</em> mode, the asset will use Neighbor Cell Measurements to send location data to the cloud.'
							}
							onClick={() => {
								updateConfig({
									nod: [...(newDesiredConfig.nod ?? [])].filter(
										(s) => s !== DataModules.NeigboringCellMeasurements,
									),
								})
							}}
							id="ncellmeas-enable"
						>
							Enabled
						</button>
						<button
							type="button"
							className={buttonClass(
								'danger',
								newDesiredConfig.nod === undefined ||
									!newDesiredConfig.nod?.includes(
										DataModules.NeigboringCellMeasurements,
									),
							)}
							data-intro={
								'In <em>Disabled</em> mode, the asset will not use Neighbor Cell Measurements to send location data to the cloud.'
							}
							onClick={() => {
								updateConfig({
									nod: [
										...new Set([
											...(newDesiredConfig.nod ?? []),
											DataModules.NeigboringCellMeasurements,
										]),
									],
								})
							}}
							id="ncellmeas-disable"
						>
							Disabled
						</button>
					</div>
				</div>
			</fieldset>

			<footer className={styles.FooterWithFullWidthButton}>
				<button
					type="button"
					className={'btn btn-primary'}
					disabled={!hasChanges}
					onClick={() => {
						update({
							cfg: newDesiredConfig,
						}).catch(console.error)
					}}
				>
					Update
				</button>
			</footer>
		</form>
	)
}
