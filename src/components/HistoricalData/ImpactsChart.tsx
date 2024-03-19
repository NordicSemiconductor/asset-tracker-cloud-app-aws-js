import { AssetHistoryChart } from 'components/HistoricalData/AssetHistoryChart.js'
import { useAssetImpactsHistory } from 'hooks/useAssetImpactsHistory.js'

export const ImpactsChart = () => (
	<AssetHistoryChart
		type={'column'}
		hideBinControls={true}
		history={useAssetImpactsHistory()}
		className={'impacts'}
	/>
)
