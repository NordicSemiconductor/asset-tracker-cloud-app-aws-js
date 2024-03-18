import type { Asset } from 'asset/asset.js'
import { useAsset } from 'hooks/useAsset.js'
import { useState } from 'react'

const pattern = '^[a-zA-Z0-9_.,@/:#-]+$'

export const Personalization = ({ asset }: { asset: Asset }) => {
	const [name, setName] = useState<string>(asset.name ?? '')
	const { update } = useAsset()

	const valid = new RegExp(pattern).test(name)
	const hasChange = name !== asset.name
	return (
		<form
			data-intro="Use this form to give your asset a recognizable name."
			onSubmit={(event) => {
				event.preventDefault()
				if (valid && hasChange) update({ name }).catch(console.error)
			}}
			id="personalization-form"
		>
			<div className="input-group has-validation">
				<label htmlFor="asset-name">Customize the name of your asset</label>
				<div
					className="d-flex flex-row align-flex-start"
					style={{ width: '100%' }}
				>
					<div className="flex-grow-1">
						<input
							className={`form-control ${
								hasChange ? (valid ? 'is-valid' : 'is-invalid') : ''
							}`}
							type="text"
							name="asset-name"
							id="asset-name"
							placeholder="e.g. 'MyThingy91'"
							onChange={({ target: { value } }) => {
								setName(value)
							}}
							value={name}
							pattern={pattern}
						/>
						<div className="invalid-feedback">
							The name must match this pattern: <code>{pattern}</code>.
						</div>
					</div>

					<button
						type="button"
						className="btn btn-primary ms-3"
						disabled={!hasChange || !valid}
						onClick={() => {
							update({ name }).catch(console.error)
						}}
					>
						Update
					</button>
				</div>
			</div>
		</form>
	)
}
