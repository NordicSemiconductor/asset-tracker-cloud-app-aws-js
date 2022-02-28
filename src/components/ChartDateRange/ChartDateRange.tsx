import { BinIntervalSelector } from 'components/ChartDateRange/BinIntervalSelector'
import { CustomDateRange } from 'components/ChartDateRange/CustomDateRange'
import { QuickDateRange } from 'components/ChartDateRange/QuickDateRange'
import { useState } from 'react'

export const ChartDateRange = ({
	hideBinControls,
	noBorder,
	className,
}: {
	hideBinControls?: boolean
	noBorder?: boolean
	className?: string
}) => {
	const [customDateRangeVisible, setCustomDateRangeVisible] =
		useState<boolean>(false)

	return (
		<form className={`form ${className ?? ''}`}>
			<fieldset className="d-flex align-items-end justify-content-between">
				{!customDateRangeVisible && (
					<QuickDateRange
						border={!(noBorder ?? false)}
						onCustom={() => setCustomDateRangeVisible(true)}
					/>
				)}
				{customDateRangeVisible && (
					<CustomDateRange
						border={!(noBorder ?? false)}
						onClose={() => setCustomDateRangeVisible(false)}
					/>
				)}
				{!(hideBinControls ?? false) && !customDateRangeVisible && (
					<BinIntervalSelector border={!(noBorder ?? false)} />
				)}
			</fieldset>
		</form>
	)
}
