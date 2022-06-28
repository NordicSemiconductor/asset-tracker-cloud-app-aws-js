import { ChartDateRange } from 'components/ChartDateRange/ChartDateRange'
import { AMChart } from 'components/HistoricalData/AMChart'
import { NoData } from 'components/NoData'

export const AssetHistoryChart = ({
	history,
	className,
}: {
	history: { value: number; date: Date }[]
	className?: string
}) => (
	<>
		<ChartDateRange className="mb-4" />
		{history.length === 0 ? (
			<NoData />
		) : (
			<AMChart data={history} type={'line'} className={className} />
		)}
	</>
)
