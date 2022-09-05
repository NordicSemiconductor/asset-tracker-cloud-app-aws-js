import { ChartDateRange } from 'components/ChartDateRange/ChartDateRange'
import { AMChart } from 'components/HistoricalData/AMChart'
import { NoData } from 'components/NoData'

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
