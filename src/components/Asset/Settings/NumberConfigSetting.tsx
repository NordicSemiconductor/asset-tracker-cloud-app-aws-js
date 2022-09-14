import { OutDatedWarning } from 'components/Asset/Settings/OutDatedWarning'
import { OutdatedConfigValueIcon, UnknownIcon } from 'components/FeatherIcon'
import { useEffect, useState } from 'react'

export const NumberConfigSetting = ({
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
	focus,
}: {
	label?: string
	intro?: string
	unit?: string
	example?: number
	step?: number
	id: 'actwt' | 'mvres' | 'mvt' | 'gnsst' | 'accath' | 'accith' | 'accito'
	onChange: (v: string) => any
	desired?: number
	reported?: number
	minimum?: number
	maximum?: number
	errorMessage?: string
	focus?: React.LegacyRef<HTMLInputElement>
}) => {
	const [input, updateInput] = useState(`${desired ?? reported}`)
	const minValue = minimum ?? 0
	const maxValue = maximum ?? Number.MAX_SAFE_INTEGER

	useEffect(() => {
		updateInput(`${desired ?? reported}`)
	}, [desired, reported, updateInput])

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
					className={`form-control ${
						errorMessage !== undefined ? 'text-danger is-invalid' : ' is-valid'
					}`}
					type="number"
					name={id}
					id={id}
					placeholder={`e.g. "${example ?? 60}"`}
					step={step}
					min={minValue}
					max={maxValue}
					value={input}
					ref={focus}
					onChange={({ target: { value } }) => {
						if (parseInt(value) < minValue) value = `${minValue}`
						if (parseInt(value) > maxValue) value = `${maxValue}`
						updateInput(value)
						onChange(value)
					}}
				/>
				<span className="input-group-text">{unit ?? 's'}</span>
				<div className="invalid-feedback">{errorMessage}</div>
			</div>
		</div>
	)
}
