import { AssetHistoryChart } from 'components/HistoricalData/AssetHistoryChart'
import { useAssetRSRPHistory } from 'hooks/useAssetRSRPHistory'

export const RSRPChart = () => (
	<AssetHistoryChart
		history={useAssetRSRPHistory()}
		className={'rsrp-history'}
	/>
)
