import classnames from 'classnames'
const cx = classnames.default

export const SwitchWithNumber = ({
	checked,
	onChange,
	label,
	id,
	value,
	updateValue,
	disabled,
}: {
	id: string
	checked: boolean
	onChange: (checked: boolean) => void
	label: string
	value: number
	updateValue: (value: number) => void
	disabled?: boolean
}) => (
	<>
		<div
			className={cx('d-flex', {
				'col-sm-7': checked,
				'col-sm-12': !checked,
			})}
		>
			<div
				className="form-check form-switch"
				data-intro="Whether to show location history of the asset."
			>
				<input
					className="form-check-input"
					type="checkbox"
					name={id}
					onChange={({ target: { checked } }) => {
						onChange(checked)
					}}
					checked={checked}
					id={id}
					disabled={disabled ?? false}
				/>
				<label htmlFor={id}>{label}</label>
			</div>
		</div>
		{checked && (
			<div className="col-sm-5">
				<div className="input-group input-group-sm">
					<span className="input-group-text">max. entries</span>
					<input
						type="number"
						className="form-control"
						value={(value ?? 10).toString()}
						min={1}
						step={1}
						onChange={({ target: { value } }) => {
							updateValue(parseInt(value, 10))
						}}
						disabled={(disabled ?? false) || !checked}
					/>
				</div>
			</div>
		)}
	</>
)
