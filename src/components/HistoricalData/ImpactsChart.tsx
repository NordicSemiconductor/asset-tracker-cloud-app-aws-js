import { AssetHistoryChart } from 'components/HistoricalData/AssetHistoryChart'
import { useAssetImpactsHistory } from 'hooks/useAssetImpactsHistory'

export const ImpactsChart = () => (
	<AssetHistoryChart
		type={'column'}
		hideBinControls={true}
		history={useAssetImpactsHistory()}
		className={'impacts'}
	/>
)
