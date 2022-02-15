import cx from 'classnames'
import { useChartDateRange } from 'hooks/useChartDateRange'

export const ChartDateRange = ({
	hideBinControls,
	className,
}: {
	hideBinControls?: boolean
	className?: string
}) => {
	const {
		startDate,
		endDate,
		setStartDate,
		setEndDate,
		defaultStart,
		defaultEnd,
		setBinInterval,
		binIntervalUnits,
		binIntervalUnit,
		binIntervalValue,
	} = useChartDateRange()

	return (
		<form className={`form ${className}`}>
			<fieldset className="row">
				<div
					className={cx({
						'col-4': !(hideBinControls ?? false),
						'col-6': hideBinControls ?? false,
					})}
				>
					<label
						htmlFor="inclusiveStartDate"
						className="col-form-label col-form-label-sm"
					>
						Start date
					</label>
					<input
						type="date"
						id="inclusiveStartDate"
						className="form-control form-control-sm"
						value={startDate.toISOString().slice(0, 10)}
						onChange={({ target: { value } }) => {
							try {
								setStartDate(
									value === ''
										? defaultStart
										: new Date(`${value}T00:00:00.000Z`),
								)
							} catch (error) {
								console.error(error)
							}
						}}
					/>
				</div>
				<div
					className={cx({
						'col-4': !(hideBinControls ?? false),
						'col-6': hideBinControls ?? false,
					})}
				>
					<label
						htmlFor="inclusiveEndDate"
						className="col-form-label col-form-label-sm"
					>
						End date
					</label>
					<input
						type="date"
						id="inclusiveEndDate"
						className="form-control form-control-sm"
						value={endDate.toISOString().slice(0, 10)}
						onChange={({ target: { value } }) => {
							try {
								setEndDate(
									value === ''
										? defaultEnd
										: new Date(`${value}T23:59:59.999Z`),
								)
							} catch (error) {
								console.error(error)
							}
						}}
					/>
				</div>
				{!(hideBinControls ?? false) && (
					<div className="col-4">
						<label
							htmlFor="binIntervalValue"
							className="col-form-label col-form-label-sm"
						>
							Bin interval
						</label>
						<div className="input-group">
							<input
								name="binIntervalValue"
								className="form-control form-control-sm"
								type="number"
								value={binIntervalValue}
								step={1}
								min={1}
								onChange={({ target: { value } }) => {
									setBinInterval(`${value}${binIntervalUnit}`)
								}}
							/>
							<select
								className="form-select  form-select-sm"
								value={binIntervalUnit}
								onChange={({ target: { value } }) => {
									setBinInterval(`${binIntervalValue}${value}`)
								}}
							>
								{Object.entries(binIntervalUnits).map(([unit, label]) => (
									<option key={unit} value={unit}>
										{label}
									</option>
								))}
							</select>
						</div>
					</div>
				)}
			</fieldset>
		</form>
	)
}
