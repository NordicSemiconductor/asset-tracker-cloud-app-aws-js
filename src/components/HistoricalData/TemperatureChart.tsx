import { AssetHistoryChart } from 'components/HistoricalData/AssetHistoryChart.js'
import { useAssetTemperatureHistory } from 'hooks/useAssetTemperatureHistory.js'

export const TemperatureChart = () => (
	<AssetHistoryChart
		history={useAssetTemperatureHistory()}
		className={'temperature-history'}
	/>
)
