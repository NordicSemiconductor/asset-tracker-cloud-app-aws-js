import { timeStreamFormatDate } from 'api/timestream'
import type { Asset } from 'asset/asset'
import { useAsset } from 'hooks/useAsset'
import { useChartDateRange } from 'hooks/useChartDateRange'
import { useServices } from 'hooks/useServices'
import { useCallback, useEffect, useState } from 'react'

type QueryFnArgs = {
	table: string
	asset: Asset
	startDate: string
	endDate: string
	binInterval: string
}

type QueryFn = (args: QueryFnArgs) => string

export const useAssetHistory = <Item extends Record<string, any>>({
	query: queryFn,
	disabled,
}: {
	query: (args: QueryFnArgs) => string
	disabled?: boolean
}): Item[] => {
	const [history, setHistory] = useState<Item[]>([])
	const { startDate, endDate, binInterval } = useChartDateRange()
	const { timestream } = useServices()
	const { asset } = useAsset()

	const cachedQueryFn = useCallback<(table: string, asset: Asset) => string>(
		(table, asset) =>
			queryFn({
				table,
				asset,
				startDate: timeStreamFormatDate(startDate),
				endDate: timeStreamFormatDate(endDate),
				binInterval,
			}),
		[startDate, endDate, binInterval],
	)

	useEffect(() => {
		if (disabled ?? false) return
		let removed = false
		if (asset === undefined) return

		timestream
			.query<Item>((table) => cachedQueryFn(table, asset))
			.then((data) => {
				if (removed) {
					console.debug(
						'[useAssetHistory]',
						'Received result, but was removed already.',
					)
					return
				}
				console.debug('[Historical Data]', data)
				setHistory(data)
			})
			.catch((error) => {
				console.error(`[useAssetHistory]`, error)
			})

		return () => {
			removed = true
		}
	}, [disabled, timestream, asset, cachedQueryFn])

	return history
}
