import { DangerIcon, IconWithText } from 'components/FeatherIcon'
import { useAsset } from 'hooks/useAsset'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export const Asset = () => {
	const { id } = useParams()
	const { setAssetId, deleteAsset } = useAsset()
	const [deleteUnlocked, setDeleteUnlocked] = useState<boolean>(false)

	useEffect(() => {
		setAssetId(id)
		return () => {
			setAssetId()
		}
	}, [id, setAssetId])

	return (
		<main className="container">
			<div className="row justify-content-center">
				<div className="col-md-10 col-lg-8 col-xl-6">
					<div className="card">
						<div className="card-header d-flex align-items-center justify-content-between">
							<span className="me-4">Asset</span>
						</div>
						<div className="card-body">
							<dl>
								<dt>Asset ID</dt>
								<dd>{id}</dd>
							</dl>
						</div>
						<div className="card-footer d-flex justify-content-end align-items-center">
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
								<label
									className="form-check-label"
									htmlFor="flexSwitchCheckDefault"
								>
									Enable to unlock asset deletion
								</label>
							</div>
							<button
								type="button"
								className="btn btn-outline-danger"
								disabled={!deleteUnlocked}
								onClick={() => {
									if (id !== undefined) deleteAsset()
								}}
							>
								<IconWithText>
									<DangerIcon />
									Delete asset
								</IconWithText>
							</button>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
