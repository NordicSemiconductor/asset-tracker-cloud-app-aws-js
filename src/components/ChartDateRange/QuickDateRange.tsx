import cx from 'classnames'
import { useChartDateRange } from 'hooks/useChartDateRange'
import { presetToRange } from 'hooks/useChartDateRangePreset'
import { useState } from 'react'

export const QuickDateRange = ({
	onCustom,
	border,
}: {
	onCustom: () => void
	border?: boolean
}) => {
	const {
		setRange,
		range: { start: startDate, end: endDate },
	} = useChartDateRange()
	const [dropdownVisible, setDropDownVisible] = useState<boolean>(false)

	const presets = [
		{ label: 'Last 24 hours', days: 1 },
		{ label: 'Last 7 days', days: 7 },
		{ label: 'Last 30 days', days: 30 },
	]

	return (
		<div
			className={cx('d-flex p-2 flex-row justify-content-between w-100', {
				border: border ?? false,
				'border-1': border ?? false,
				rounded: border ?? false,
			})}
		>
			<div className="d-flex flex-column me-2">
				<label
					htmlFor="quickRangeButton"
					className="col-form-label col-form-label-sm"
				>
					Date range
				</label>
				<div className="btn-group btn-group-sm" role="group">
					<button
						id="quickRangeButton"
						type="button"
						className={cx(`btn btn-outline-secondary dropdown-toggle`, {
							show: dropdownVisible,
						})}
						aria-expanded={dropdownVisible}
						onClick={() => setDropDownVisible((v) => !v)}
					>
						Change range
					</button>
					<ul
						className={cx('dropdown-menu pt-0 pb-0', {
							show: dropdownVisible,
						})}
						aria-labelledby="quickRangeButton"
						style={{ top: '32px' }}
					>
						{presets.map(({ label, days }, k) => (
							<li key={k}>
								<button
									type="button"
									className="btn"
									onClick={() => {
										setDropDownVisible(false)
										setRange(presetToRange({ days }))
									}}
								>
									{label}
								</button>
							</li>
						))}
						<li>
							<button
								type="button"
								className="btn"
								onClick={() => {
									setDropDownVisible(false)
									onCustom()
								}}
							>
								Custom
							</button>
						</li>
					</ul>
				</div>
			</div>
			<div className="d-flex flex-column me-2">
				<span className="col-form-label col-form-label-sm">Start</span>
				<small className="pt-1">{startDate.toLocaleDateString()}</small>
			</div>
			<div className="d-flex flex-column">
				<span className="col-form-label col-form-label-sm">End</span>
				<small className="pt-1">{endDate.toLocaleDateString()}</small>
			</div>
		</div>
	)
}
