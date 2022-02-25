import { DangerIcon, IconWithText } from 'components/FeatherIcon'
import { useAsset } from 'hooks/useAsset'
import { useState } from 'react'

export const DeleteAsset = ({ onDeleted }: { onDeleted: () => void }) => {
	const [deletionError, setDeletionError] = useState<Error>()
	const [deleteUnlocked, setDeleteUnlocked] = useState<boolean>(false)
	const [deleteing, setDeleting] = useState<boolean>(false)
	const { deleteAsset } = useAsset()

	return (
		<>
			<form className="d-flex justify-content-between align-items-center">
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
						Enable to unlock asset deletion
					</label>
				</div>
				<button
					type="button"
					className="btn btn-outline-danger"
					disabled={!deleteUnlocked || deleteing}
					onClick={() => {
						setDeleting(true)
						deleteAsset()
							.then(() => {
								onDeleted()
							})
							.catch((err) => {
								console.error(`[delete asset]`, err)
								setDeletionError(err)
							})
					}}
				>
					<IconWithText>
						<DangerIcon />
						Delete asset
					</IconWithText>
				</button>
			</form>
			{deletionError && (
				<div className="alert alert-danger mt-2">{deletionError.message}</div>
			)}
		</>
	)
}
