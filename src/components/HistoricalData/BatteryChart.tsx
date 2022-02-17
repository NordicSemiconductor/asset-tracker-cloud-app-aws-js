import { AssetHistoryChart } from 'components/HistoricalData/AssetHistoryChart'
import { useAssetBatteryHistory } from 'hooks/useAssetBatteryHistory'

export const BatteryChart = () => (
	<AssetHistoryChart
		history={useAssetBatteryHistory()}
		className={'battery-history'}
	/>
)
