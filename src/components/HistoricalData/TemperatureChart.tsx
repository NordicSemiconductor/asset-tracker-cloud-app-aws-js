import { AssetHistoryChart } from 'components/HistoricalData/AssetHistoryChart'
import { useAssetTemperatureHistory } from 'hooks/useAssetTemperatureHistory'

export const TemperatureChart = () => (
	<AssetHistoryChart
		history={useAssetTemperatureHistory()}
		className={'temperature-history'}
	/>
)
