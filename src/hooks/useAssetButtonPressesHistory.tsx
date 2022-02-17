import { SensorProperties } from 'asset/asset'
import { useAssetHistory } from 'hooks/useAssetHistory'
import { useCallback } from 'react'

export const useAssetButtonPressesHistory = () =>
	useAssetHistory<{
		date: Date
		value: number
	}>({
		query: useCallback(
			({ asset, table, startDate, endDate }) => `
		SELECT
        time as date,
        measure_value::double AS value
		FROM ${table}
		WHERE deviceId='${asset.id}' 
		AND measure_name='${SensorProperties.Button}' 
		AND time >= '${startDate}'
		AND time <= '${endDate}'
		ORDER BY time DESC
	`,
			[],
		),
	})
