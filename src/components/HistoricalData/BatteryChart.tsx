import { SensorProperties } from 'asset/asset'
import { AssetHistoryChart } from 'components/HistoricalData/AssetHistoryChart'
import { useAssetHistory } from 'hooks/useAssetHistory'

export const BatteryChart = () => {
	const history = useAssetHistory<{
		date: Date
		value: number
	}>({
		query: ({ asset, table, startDate, endDate, binInterval }) => `
		SELECT
		bin(time, ${binInterval}) as date,
		MIN(
			measure_value::double
		) / 1000 AS value
		FROM ${table}
		WHERE deviceId='${asset.id}' 
		AND measure_name='${SensorProperties.Battery}' 
		AND time >= '${startDate}'
		AND time <= '${endDate}'
		GROUP BY bin(time, ${binInterval})
		ORDER BY bin(time, ${binInterval}) DESC
	`,
	})
	return <AssetHistoryChart history={history} className={'battery-history'} />
}
