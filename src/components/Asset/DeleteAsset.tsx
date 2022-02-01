import { DangerIcon, IconWithText } from 'components/FeatherIcon'
import { useAsset } from 'hooks/useAsset'
import { useState } from 'react'

export const DeleteAsset = () => {
	const { deleteAsset } = useAsset()
	const [deleteUnlocked, setDeleteUnlocked] = useState<boolean>(false)

	return (
		<form className="d-flex justify-content-between align-items-center">
			<div className="form-check form-switch me-2">
				<input
					className="form-check-input"
					type="checkbox"
					id="flexSwitchCheckDefault"
					checked={deleteUnlocked}
					onChange={({ target: { checked } }) => {
						setDeleteUnlocked(checked)
					}}
				/>
				<label className="form-check-label" htmlFor="flexSwitchCheckDefault">
					Enable to unlock asset deletion
				</label>
			</div>
			<button
				type="button"
				className="btn btn-outline-danger"
				disabled={!deleteUnlocked}
				onClick={() => {
					deleteAsset()
				}}
			>
				<IconWithText>
					<DangerIcon />
					Delete asset
				</IconWithText>
			</button>
		</form>
	)
}
