import { SensorProperties } from 'asset/asset.js'
import { useAssetHistory } from 'hooks/useAssetHistory.js'
import { useCallback } from 'react'

export const useAssetImpactsHistory = () =>
	useAssetHistory<{
		date: Date
		value: number
	}>({
		query: useCallback(
			({ asset, table, startDate, endDate }) => `
		SELECT
        date_trunc('second', time) as date,
        measure_value::double AS value
		FROM ${table}
		WHERE deviceId='${asset.id}' 
		AND measure_name='${SensorProperties.Impact}' 
		AND date_trunc('second', time) >= '${startDate}'
		AND date_trunc('second', time) <= '${endDate}'
		ORDER BY time DESC
	`,
			[],
		),
	})
