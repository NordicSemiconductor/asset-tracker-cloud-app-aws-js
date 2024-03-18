import type { Asset } from 'asset/asset.js'
import { FilePicker } from 'components/FOTA/FilePicker.js'
import { useAsset } from 'hooks/useAsset.js'
import { useFOTA } from 'hooks/useFOTA.js'
import { useServices } from 'hooks/useServices.js'
import { useState } from 'react'
import semver from 'semver'

const getNextAppVersion = (version: string): string =>
	semver.inc(version, 'patch') ?? version

export const CreateFOTAJob = ({ asset }: { asset: Asset }) => {
	const { twin } = useAsset()
	const { iot } = useServices()
	const { reload } = useFOTA()
	const [upgradeFile, setUpgradeFile] = useState<File>()
	const [nextVersion, setNextVersion] = useState<string>(
		getNextAppVersion(twin?.reported.dev?.v.appV ?? '0.0.0-development'),
	)
	const [saving, setSaving] = useState<boolean>(false)
	const [error, setError] = useState<Error>()

	return (
		<>
			<form className="form">
				<fieldset>
					<div
						className="mb-3"
						data-intro="Select the .bin file to be included in the job."
					>
						<label htmlFor="file" className="form-label">
							Firmware file{' '}
							{upgradeFile && <span>({upgradeFile.size} bytes)</span>}
						</label>
						<p>
							<FilePicker
								id={'file'}
								accept={'text/octet-stream,.bin'}
								className="form-control"
								maxSize={1024 * 1024}
								onError={setError}
								disabled={saving}
								onFile={(file) => {
									setError(undefined)
									setUpgradeFile(file)
									const semverMatch = /v([0-9]+\.[0-9]+\..+)\.[^.]+$/.exec(
										file.name,
									)
									if (semverMatch) {
										setNextVersion(semverMatch[1])
									}
								}}
							/>
						</p>
					</div>
				</fieldset>
				{upgradeFile && (
					<div className="d-flex justify-content-between align-items-end">
						<div data-intro="Configure the version number of this upgrade.">
							<label htmlFor={'nextVersion'} className="form-label">
								Firmware version
							</label>
							<input
								type={'text'}
								disabled={saving}
								name={'nextVersion'}
								id={'nextVersion'}
								value={nextVersion}
								onChange={({ target: { value } }) => {
									setNextVersion(value)
								}}
								className="form-control"
							/>
						</div>
						<button
							type="button"
							disabled={saving}
							onClick={() => {
								setSaving(true)
								iot
									.createUpgradeJob(asset.id, {
										file: upgradeFile,
										version: nextVersion,
									})
									.then(() => {
										reload()
										setNextVersion('')
										setUpgradeFile(undefined)
										setSaving(false)
									})
									.catch(setError)
							}}
							className="btn btn-primary"
						>
							{saving && 'Creating ...'}
							{!saving && 'Create upgrade job'}
						</button>
					</div>
				)}
			</form>
			{error && <div className="alert alert-warning">{error.message}</div>}
		</>
	)
}
