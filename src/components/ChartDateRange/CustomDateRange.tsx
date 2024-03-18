import classnames from 'classnames'
const cx = classnames.default
import { CloseIcon, IconWithText } from 'components/FeatherIcon.js'
import { useChartDateRange } from 'hooks/useChartDateRange.js'
import { useChartDateRangePreset } from 'hooks/useChartDateRangePreset.js'

export const CustomDateRange = ({
	onClose,
	border,
}: {
	onClose: () => void
	border?: boolean
}) => {
	const {
		defaultStart,
		defaultEnd,
		setRange,
		range: { start: startDate, end: endDate },
	} = useChartDateRange()

	const { disableAutoUpdate } = useChartDateRangePreset()

	return (
		<div
			className={cx(
				`d-flex p-2 align-items-end justify-content-between w-100`,
				{
					border: border ?? false,
					'border-1': border ?? false,
					rounded: border ?? false,
				},
			)}
		>
			<div className="me-2">
				<label
					htmlFor="inclusiveStartDate"
					className="col-form-label col-form-label-sm"
				>
					Start
				</label>
				<input
					type="date"
					id="inclusiveStartDate"
					className="form-control form-control-sm"
					value={startDate.toISOString().slice(0, 10)}
					onChange={({ target: { value } }) => {
						try {
							setRange({
								start:
									value === ''
										? defaultStart
										: new Date(`${value}T00:00:00.000Z`),
								end: endDate,
							})
							disableAutoUpdate()
						} catch (error) {
							console.error(error)
						}
					}}
				/>
			</div>
			<div className="me-2">
				<label
					htmlFor="inclusiveEndDate"
					className="col-form-label col-form-label-sm"
				>
					End
				</label>
				<input
					type="date"
					id="inclusiveEndDate"
					className="form-control form-control-sm"
					value={endDate.toISOString().slice(0, 10)}
					onChange={({ target: { value } }) => {
						try {
							setRange({
								start: startDate,
								end:
									value === ''
										? defaultEnd
										: new Date(`${value}T23:59:59.999Z`),
							})
							disableAutoUpdate()
						} catch (error) {
							console.error(error)
						}
					}}
				/>
			</div>
			<div>
				<button
					type="button"
					className="btn btn-outline-secondary btn-sm"
					onClick={() => {
						onClose()
					}}
				>
					<IconWithText>
						<CloseIcon />
						close
					</IconWithText>
				</button>
			</div>
		</div>
	)
}
