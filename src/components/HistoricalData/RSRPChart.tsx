import { AssetHistoryChart } from 'components/HistoricalData/AssetHistoryChart.js'
import { useAssetRSRPHistory } from 'hooks/useAssetRSRPHistory.js'

export const RSRPChart = () => (
	<AssetHistoryChart
		history={useAssetRSRPHistory()}
		className={'rsrp-history'}
	/>
)
