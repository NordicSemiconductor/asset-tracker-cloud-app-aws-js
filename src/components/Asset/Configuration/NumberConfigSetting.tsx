import classnames from 'classnames'
const cx = classnames.default
import { OutDatedWarning } from 'components/Asset/Configuration/OutDatedWarning.js'
import { OutdatedConfigValueIcon, UnknownIcon } from 'components/FeatherIcon.js'
import { forwardRef, useState } from 'react'

export const NumberConfigSetting = forwardRef<
	HTMLInputElement,
	{
		label?: string
		intro?: string
		unit?: string
		example?: number
		step?: number
		id: 'actwt' | 'mvres' | 'mvt' | 'loct' | 'accath' | 'accith' | 'accito'
		onChange: (v: string) => any
		desired?: number
		reported?: number
		minimum?: number
		maximum?: number
		errorMessage?: string
	}
>(
	(
		{
			label,
			intro,
			id,
			unit,
			example,
			step,
			onChange,
			desired,
			reported,
			minimum,
			maximum,
			errorMessage,
		},
		ref,
	) => {
		const [input, updateInput] = useState(`${desired ?? reported}`)
		const minValue = minimum ?? 0
		const maxValue = maximum ?? Number.MAX_SAFE_INTEGER

		return (
			<div className="input-group mb-2" data-intro={intro}>
				{label !== undefined && (
					<label className="form-label" htmlFor={id}>
						{label}:
					</label>
				)}
				<div className="input-group mb-2">
					<OutDatedWarning
						desired={desired}
						reported={reported}
						onNotReported={
							<span className="input-group-text text-danger">
								<abbr
									title={'Asset has not reported this setting, yet.'}
									className=" d-flex justify-content-center align-items-center"
								>
									<UnknownIcon />
								</abbr>
							</span>
						}
						onOutDated={(current) => (
							<span className="input-group-text d-flex justify-content-center align-items-center">
								<abbr
									className=" d-flex justify-content-center align-items-center"
									title={`Asset has an outdated value. Current value: ${JSON.stringify(
										current,
									)}.`}
								>
									<OutdatedConfigValueIcon />
								</abbr>
							</span>
						)}
					/>
					<input
						className={cx(`form-control`, {
							'text-danger is-invalid': errorMessage,
							'is-valid': errorMessage == null,
						})}
						type="number"
						name={id}
						id={id}
						placeholder={`e.g. "${example ?? 60}"`}
						step={step}
						min={minValue}
						max={maxValue}
						value={input}
						ref={ref}
						onChange={({ target: { value } }) => {
							if (parseInt(value) < minValue) value = `${minValue}`
							if (parseInt(value) > maxValue) value = `${maxValue}`
							updateInput(value)
							onChange(value)
						}}
					/>
					<span className="input-group-text">{unit ?? 's'}</span>
					{errorMessage != null ? (
						<div className="invalid-feedback">{errorMessage}</div>
					) : null}
				</div>
			</div>
		)
	},
)
