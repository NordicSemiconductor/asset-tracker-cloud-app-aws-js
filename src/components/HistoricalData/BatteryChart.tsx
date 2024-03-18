import { AssetHistoryChart } from 'components/HistoricalData/AssetHistoryChart.js'
import { useAssetBatteryHistory } from 'hooks/useAssetBatteryHistory.js'

export const BatteryChart = () => (
	<AssetHistoryChart
		history={useAssetBatteryHistory()}
		className={'battery-history'}
	/>
)
