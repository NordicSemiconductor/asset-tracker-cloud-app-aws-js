import { timeStreamFormatDate } from 'api/timestream'
import type {
	AssetHistory,
	AssetInfo,
	AssetSensor,
	Battery,
	Button,
	Environment,
	GNSS,
	Roaming,
} from 'asset/asset'
import { useAsset } from 'hooks/useAsset'
import { useChartDateRange } from 'hooks/useChartDateRange'
import { useServices } from 'hooks/useServices'
import { useEffect, useState } from 'react'

export enum SensorProperties {
	Battery = 'bat',
	Environment = 'env',
	GNSS = 'gnss',
	Roaming = 'roam',
	Asset = 'dev',
	Button = 'btn',
}

type SharedArgs = {
	disabled?: boolean
}

type useAssetHistoryType = {
	(
		_: {
			sensor: SensorProperties.GNSS
		} & SharedArgs,
	): AssetHistory<GNSS>
	(
		_: {
			sensor: SensorProperties.Battery
		} & SharedArgs,
	): AssetHistory<Battery>
	(
		_: {
			sensor: SensorProperties.Environment
		} & SharedArgs,
	): AssetHistory<Environment>
	(
		_: {
			sensor: SensorProperties.Roaming
		} & SharedArgs,
	): AssetHistory<Roaming>
	(
		_: {
			sensor: SensorProperties.Asset
		} & SharedArgs,
	): AssetHistory<AssetInfo>
	(
		_: {
			sensor: SensorProperties.Button
		} & SharedArgs,
	): AssetHistory<Button>
	(
		_: {
			sensor: SensorProperties
		} & SharedArgs,
	): AssetHistory<any>
}

export const useAssetHistory: useAssetHistoryType = <
	Sensor extends AssetSensor,
>({
	sensor,
	disabled,
}: {
	sensor: SensorProperties
	disabled?: boolean
}): AssetHistory<Sensor> => {
	const [history, setHistory] = useState<AssetHistory<Sensor>>([])
	const { startDate, endDate } = useChartDateRange()
	const { timestream } = useServices()
	const { asset } = useAsset()

	useEffect(() => {
		if (disabled ?? false) return
		let removed = false
		if (asset === undefined) return

		timestream
			.query<{
				date: Date
				value: number
			}>(
				// FIXME: support more sensors
				(table) => `
			SELECT
			bin(time, 1h) as date,
			MIN(
				measure_value::double
			) / 1000 AS value
			FROM ${table}
			WHERE deviceId='${asset.id}' 
			AND measure_name='${sensor}' 
			AND time >= '${timeStreamFormatDate(startDate)}'
			AND time <= '${timeStreamFormatDate(endDate)}'
						GROUP BY bin(time, 1h)
			ORDER BY bin(time, 1h) DESC
		`,
			)
			.then((data) => {
				if (removed) {
					console.debug(
						'[useAssetHistory]',
						'Received result, but was removed already.',
					)
					return
				}
				console.debug('[Historical Data]', data)
				setHistory(
					data.map(({ date, value }) => ({
						ts: date.getTime(),
						v: value,
					})) as AssetHistory<Sensor>,
				)
			})
			.catch((error) => {
				console.error(`[useAssetHistory]`, error)
			})

		return () => {
			removed = true
		}
	}, [disabled, asset, timestream, endDate, sensor, startDate])

	return history
}
