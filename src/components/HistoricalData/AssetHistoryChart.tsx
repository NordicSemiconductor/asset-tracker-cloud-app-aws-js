import { ChartDateRange } from 'components/ChartDateRange/ChartDateRange.js'
import { AMChart } from 'components/HistoricalData/AMChart.js'
import { NoData } from 'components/NoData.js'

export const AssetHistoryChart = ({
	history,
	className,
	type,
	hideBinControls,
}: {
	history: { value: number; date: Date }[]
	className?: string
	type?: 'line' | 'column'
	hideBinControls?: boolean
}) => (
	<>
		<ChartDateRange
			className="mb-4"
			hideBinControls={hideBinControls ?? false}
		/>
		{history.length === 0 ? (
			<NoData />
		) : (
			<AMChart data={history} type={type ?? 'line'} className={className} />
		)}
	</>
)
