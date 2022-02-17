import { SensorProperties } from 'asset/asset'
import { useAssetHistory } from 'hooks/useAssetHistory'
import { useCallback } from 'react'

export const useAssetTemperatureHistory = () =>
	useAssetHistory<{
		date: Date
		value: number
	}>({
		query: useCallback(
			({ asset, table, startDate, endDate, binInterval }) => `
    SELECT
    bin(time, ${binInterval}) as date,
    MIN(measure_value::double) as value
    FROM ${table}
    WHERE deviceId='${asset.id}' 
    AND measure_name='${SensorProperties.Environment}.temp' 
    AND time >= '${startDate}'
    AND time <= '${endDate}'
    GROUP BY bin(time, ${binInterval})
    ORDER BY bin(time, ${binInterval}) DESC
`,
			[],
		),
	})
