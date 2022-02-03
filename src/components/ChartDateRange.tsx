import { useChartDateRange } from 'hooks/useChartDateRange'

export const ChartDateRange = () => {
	const {
		startDate,
		endDate,
		setStartDate,
		setEndDate,
		defaultStart,
		defaultEnd,
	} = useChartDateRange()
	return (
		<form className="mt-2 me-2 mb-2 ms-2">
			<fieldset className="row">
				<div className="col-6">
					<div className="row">
						<div className="col-sm-5">
							<label
								htmlFor="inclusiveStartDate"
								className="col-form-label col-form-label-sm"
							>
								Start date
							</label>
						</div>
						<div className="col-sm-7">
							<input
								type="date"
								id="inclusiveStartDate"
								className="form-control form-control-sm"
								value={startDate.toISOString().substring(0, 10)}
								onChange={({ target: { value } }) => {
									try {
										setStartDate(
											value === ''
												? defaultStart
												: new Date(`${value}T00:00:00.000Z`),
										)
									} catch {
										// pass
									}
								}}
							/>
						</div>
					</div>
				</div>
				<div className="col-6">
					<div className="row">
						<div className="col-sm-5">
							<label
								htmlFor="inclusiveEndDate"
								className="col-form-label col-form-label-sm"
							>
								End date
							</label>
						</div>
						<div className="col-sm-7">
							<input
								type="date"
								id="inclusiveEndDate"
								className="form-control form-control-sm"
								value={endDate.toISOString().substring(0, 10)}
								onChange={({ target: { value } }) => {
									try {
										setEndDate(
											value === ''
												? defaultEnd
												: new Date(`${value}T23:59:59.999Z`),
										)
									} catch {
										// pass
									}
								}}
							/>
						</div>
					</div>
				</div>
			</fieldset>
		</form>
	)
}
