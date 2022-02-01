import { DangerIcon, IconWithText } from 'components/FeatherIcon'
import { Main } from 'components/Main'
import { useAuth } from 'hooks/useAuth'
import { useState } from 'react'

export const Account = () => {
	const { attributes, deleteAccount } = useAuth()
	const [deleteUnlocked, setDeleteUnlocked] = useState<boolean>(false)
	return (
		<Main>
			<div className="card">
				<div className="card-header d-flex align-items-center justify-content-between">
					<span className="me-4">Account</span>
				</div>
				<div className="card-body">
					<dl>
						<dt>ID</dt>
						<dd>{attributes?.sub}</dd>
						<dt>E-mail</dt>
						<dd>{attributes?.email}</dd>
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
							Enable to unlock account deletion
						</label>
					</div>
					<button
						type="button"
						className="btn btn-outline-danger"
						disabled={!deleteUnlocked}
						onClick={() => {
							deleteAccount()
						}}
					>
						<IconWithText>
							<DangerIcon />
							Delete account
						</IconWithText>
					</button>
				</div>
			</div>
		</Main>
	)
}
