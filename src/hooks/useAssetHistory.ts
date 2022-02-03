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
import { useEffect, useState } from 'react'

export enum SensorProperties {
	Battery = 'bat',
	Environment = 'env',
	GNSS = 'gnss',
	Roaming = 'roam',
	Asset = 'dev',
	Button = 'btn',
}

type PropertyName = SensorProperties | string

type SharedArgs = {
	enabled?: boolean
	startDate?: Date
	endDate?: Date
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
}

export const useAssetHistory: useAssetHistoryType = <T extends AssetSensor>({
	sensor,
	enabled,
	startDate,
	endDate,
}: {
	sensor: PropertyName
	startDate?: Date
	endDate?: Date
	enabled?: boolean
}): AssetHistory<T> => {
	const [history] = useState<AssetHistory<T>>([])

	useEffect(() => {
		if (!(enabled ?? true)) return
	}, [enabled])

	// FIXME: implement

	return history
}
