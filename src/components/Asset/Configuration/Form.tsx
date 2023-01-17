import type { Static } from '@sinclair/typebox'
import { AssetConfig, DataModules } from 'asset/asset.js'
import { validateConfig } from 'asset/validateConfig.js'
import cx from 'classnames'
import styles from 'components/Asset/Configuration/Configuration.module.css'
import { ConfigurationExplainer } from 'components/Asset/Configuration/ConfigurationExplainer.js'
import { NumberConfigSetting } from 'components/Asset/Configuration/NumberConfigSetting.js'
import { OutDatedWarning } from 'components/Asset/Configuration/OutDatedWarning.js'
import { Collapsable } from 'components/Collapsable.js'
import {
	IconWithText,
	InfoIcon,
	OutdatedConfigValueIcon,
	UnknownIcon,
} from 'components/FeatherIcon.js'
import equal from 'fast-deep-equal'
import { useRef } from 'react'
import { validateWithJSONSchema } from 'utils/validateWithJSONSchema.js'

const MAX_INT32 = 2147483647

const buttonClass = (
	color: 'info' | 'success' | 'danger',
	outline: boolean,
): string =>
	cx('btn', {
		[`btn-${color}`]: !outline,
		[`btn-outline-${color}`]: outline,
	})

export const Form = ({
	newDesiredConfig,
	reportedConfig,
	updateNewDesiredConfig,
	currentDesiredConfig,
	onSave,
}: {
	newDesiredConfig: Static<typeof AssetConfig>
	reportedConfig?: Static<typeof AssetConfig>
	updateNewDesiredConfig: (cfg: Partial<Static<typeof AssetConfig>>) => unknown
	currentDesiredConfig: Static<typeof AssetConfig>
	onSave: (cfg: Static<typeof AssetConfig>) => unknown
}) => {
	const updateConfigProperty =
		(property: string, parser?: (v: string) => number) => (value: string) => {
			updateNewDesiredConfig({
				[property]: parser !== undefined ? parser(value) : parseInt(value, 10),
			})
		}
	const isActive =
		newDesiredConfig.act !== undefined
			? newDesiredConfig.act === true
			: reportedConfig?.act === true

	const mvresRef = useRef<HTMLInputElement>(null)
	const accitoRef = useRef<HTMLInputElement>(null)
	const mvtRef = useRef<HTMLInputElement>(null)

	const hasChanges = !equal(newDesiredConfig, currentDesiredConfig)

	const isNewDesiredConfigValid = !(
		'errors' in validateWithJSONSchema(AssetConfig)(newDesiredConfig)
	)
	const formValidationErrors: Record<string, string> =
		validateConfig(newDesiredConfig)
	const areFormValuesValid = Object.keys(formValidationErrors).length === 0

	return (
		<form
			className={styles.ConfigurationForm}
			id="asset-configuration-form"
			onSubmit={(e) => {
				e.preventDefault()
			}}
		>
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
								updateNewDesiredConfig({ act: false })
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
								updateNewDesiredConfig({ act: true })
							}}
							id="active-mode"
						>
							Active
						</button>
					</div>
				</div>
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
			<fieldset data-intro={'This configures the <em>passive</em> mode.'}>
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
						errorMessage={formValidationErrors['mvres']}
						ref={mvresRef}
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
						ref={mvtRef}
					/>
				</div>
			</fieldset>
			<fieldset data-intro={'This configures the <em>accelerometer</em>.'}>
				<legend>Accelerometer Settings</legend>
				<NumberConfigSetting
					label={'Accelerometer Activity Threshold'}
					intro={
						'Minimal absolute value for an accelerometer reading to be considered movement. Range: 0 to 78.4532 m/s².'
					}
					id={'accath'}
					example={10.5}
					step={0.1}
					minimum={0}
					maximum={78.4532}
					unit={'m/s²'}
					desired={newDesiredConfig.accath}
					reported={reportedConfig?.accath}
					onChange={updateConfigProperty('accath', parseFloat)}
					errorMessage={formValidationErrors['accath']}
				/>
				<NumberConfigSetting
					label={'Accelerometer Inactivity Threshold'}
					intro={
						'Maximum absolute value for an accelerometer reading to be considered stillness. Should be lower than the activity threshold. Range: 0 to 78.4532 m/s².'
					}
					id={'accith'}
					example={5.7}
					step={0.1}
					minimum={0}
					maximum={78.4532}
					unit={'m/s²'}
					desired={newDesiredConfig.accith}
					reported={reportedConfig?.accith}
					onChange={updateConfigProperty('accith', parseFloat)}
					errorMessage={formValidationErrors['accith']}
				/>
				<NumberConfigSetting
					label={'Accelerometer Inactivity Timeout'}
					intro={
						'Accelerometer Inactivity Timeout in s: Hysteresis timeout for stillness detection. Range: 0.08 to 5242.88 m/s².'
					}
					id={'accito'}
					example={1.2}
					step={0.01}
					minimum={0.08}
					maximum={5242.88}
					unit={'s'}
					desired={newDesiredConfig.accito}
					reported={reportedConfig?.accito}
					onChange={updateConfigProperty('accito', parseFloat)}
					errorMessage={formValidationErrors['accito']}
					ref={accitoRef}
				/>
			</fieldset>
			<fieldset data-intro={'How long to try to acquire location.'}>
				<legend>Location Timeout</legend>
				<NumberConfigSetting
					id={'loct'}
					desired={newDesiredConfig.loct}
					reported={reportedConfig?.loct}
					example={60}
					onChange={updateConfigProperty('loct')}
					minimum={1}
					maximum={MAX_INT32}
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
								updateNewDesiredConfig({
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
								updateNewDesiredConfig({
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
								updateNewDesiredConfig({
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
								updateNewDesiredConfig({
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
			<div className={styles.FullWidthGrayBox}>
				<Collapsable
					title={
						<IconWithText>
							<InfoIcon size={22} />
							Configuration Explainer
						</IconWithText>
					}
					id="asset:configuration-explainer"
					data-intro="This explains how the current asset configuration will affect the behavior of the asset."
				>
					<ConfigurationExplainer
						configuration={newDesiredConfig}
						onMovementResolutionClicked={() => {
							console.log(mvresRef.current)
							mvresRef.current?.focus()
						}}
						onAccelerometerInactivityTimeoutClicked={() => {
							console.log(accitoRef.current)
							accitoRef.current?.focus()
						}}
						onMovementTimeoutClicked={() => {
							console.log(mvtRef.current)
							mvtRef.current?.focus()
						}}
					/>
				</Collapsable>
			</div>
			<footer className={styles.FullWidth}>
				<button
					type="button"
					className={'btn btn-primary'}
					disabled={
						!hasChanges || !areFormValuesValid || !isNewDesiredConfigValid
					}
					onClick={() => {
						onSave(newDesiredConfig)
					}}
				>
					Update
				</button>
			</footer>
		</form>
	)
}
