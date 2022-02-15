import type { DeviceUpgradeFirmwareJob } from 'api/iot/createFirmwareJob'
import { CollapsableCard } from 'components/CollapsableCard'
import { DangerIcon, IconWithText } from 'components/FeatherIcon'
import { RelativeTime } from 'components/RelativeTime'
import { useFOTA } from 'hooks/useFOTA'
import { useServices } from 'hooks/useServices'
import { useState } from 'react'

export const Job = ({ job }: { job: DeviceUpgradeFirmwareJob }) => {
	const {
		iot: { cancelUpgradeJob, deleteUpgradeJob },
	} = useServices()
	const { reload } = useFOTA()
	const [cancelUnlocked, setCancelUnlocked] = useState<boolean>(false)
	const [deleteUnlocked, setDeleteUnlocked] = useState<boolean>(false)
	const {
		jobId,
		status,
		description,
		queuedAt,
		startedAt,
		lastUpdatedAt,
		document: { size, fwversion, location, filename },
	} = job
	const isInProgress = status === 'IN_PROGRESS'
	const canCancel = ['QUEUED', 'IN_PROGRESS'].includes(status)
	const canDelete = ['FAILED', 'CANCELED', 'SUCCEEDED'].includes(status)
	return (
		<CollapsableCard
			id={`job:${jobId}`}
			title={
				<>
					<code>{fwversion}</code> (<code>{status}</code>)
				</>
			}
			data-job-id={jobId}
		>
			<div className="card-body">
				<dl data-test="firmware-upgrade-job-info">
					<dt>Queued</dt>
					<dd>{queuedAt ? <RelativeTime ts={queuedAt} /> : <>&mdash;</>}</dd>
					<dt>Started</dt>
					<dd>{startedAt ? <RelativeTime ts={startedAt} /> : <>&mdash;</>}</dd>
					<dt>Last update</dt>
					<dd>
						{lastUpdatedAt ? <RelativeTime ts={lastUpdatedAt} /> : <>&mdash;</>}
					</dd>
					<dt>Description</dt>
					<dd data-test="description">{description}</dd>
					<dt>Firmware</dt>
					<dd data-test="firmware">
						<a href={location} target="_blank" rel="noopener noreferrer">
							{filename}
						</a>
					</dd>
					<dt>Version</dt>
					<dd data-test="version">{fwversion}</dd>
					<dt>Size</dt>
					<dd data-test="size">{size} bytes</dd>
				</dl>
			</div>
			<div className="card-footer">
				{canCancel && (
					<>
						<div className="d-flex justify-content-between align-items-center">
							<div className="form-check form-switch me-2">
								<input
									className="form-check-input"
									type="checkbox"
									id="unlockCancel"
									checked={cancelUnlocked}
									onChange={({ target: { checked } }) => {
										setCancelUnlocked(checked)
									}}
								/>
								<label className="form-check-label" htmlFor="unlockCancel">
									Enable to unlock job cancellation
								</label>
							</div>
							<button
								type="button"
								className="btn btn-outline-danger"
								disabled={!cancelUnlocked}
								onClick={() => {
									cancelUpgradeJob(job, isInProgress)
										.then(() => {
											reload()
										})
										.catch(console.error)
								}}
							>
								<IconWithText>
									<DangerIcon />
									Cancel job
								</IconWithText>
							</button>
						</div>
						{isInProgress && (
							<div className="alert alert-warning mt-2">
								Canceling a job which is <code>IN_PROGRESS</code>, will cause a
								device which is executing the job to be unable to update the job
								execution status. Use caution and ensure that each device
								executing a job which is canceled is able to recover to a valid
								state.
							</div>
						)}
					</>
				)}

				{canDelete && (
					<div className="d-flex justify-content-between align-items-center">
						<div className="form-check form-switch me-2">
							<input
								className="form-check-input"
								type="checkbox"
								id="unlockDelete"
								checked={deleteUnlocked}
								onChange={({ target: { checked } }) => {
									setDeleteUnlocked(checked)
								}}
							/>
							<label className="form-check-label" htmlFor="unlockDelete">
								Enable to unlock job deletion
							</label>
						</div>
						<div>
							<button
								type="button"
								className="btn btn-outline-danger"
								onClick={() => {
									deleteUpgradeJob(job)
										.then(() => {
											reload()
										})
										.catch(console.error)
								}}
								disabled={!deleteUnlocked}
							>
								Delete
							</button>
						</div>
					</div>
				)}
			</div>
		</CollapsableCard>
	)
}
