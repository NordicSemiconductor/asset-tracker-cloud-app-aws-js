export const SwitchWithNumber = ({
	enabled,
	onChange,
	label,
	id,
	value,
	updateValue,
}: {
	id: string
	enabled: boolean
	onChange: (checked: boolean) => void
	label: string
	value: number
	updateValue: (value: number) => void
}) => (
	<>
		<div className="col-sm-6 d-flex">
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
					checked={enabled}
					id={id}
				/>
				<label htmlFor={id}>{label}</label>
			</div>
		</div>
		<div className="col-sm-6">
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
					disabled={!enabled}
				/>
			</div>
		</div>
	</>
)
