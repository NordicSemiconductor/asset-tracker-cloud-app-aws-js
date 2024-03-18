import classnames from 'classnames'
const cx = classnames.default
import { useChartDateRange } from 'hooks/useChartDateRange.js'

export const BinIntervalSelector = ({ border }: { border?: boolean }) => {
	const {
		setBinInterval,
		binIntervalUnits,
		binIntervalUnit,
		binIntervalValue,
	} = useChartDateRange()

	return (
		<div
			className={cx(`d-flex p-2 ms-2 flex-column`, {
				border: border ?? false,
				'border-1': border ?? false,
				rounded: border ?? false,
			})}
		>
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
	)
}
