import { timeStreamFormatDate } from 'api/timestream.js'
import type { Asset } from 'asset/asset.js'
import { useAsset } from 'hooks/useAsset.js'
import { useChartDateRange } from 'hooks/useChartDateRange.js'
import { useServices } from 'hooks/useServices.js'
import { useCallback, useEffect, useState } from 'react'

type QueryFnArgs = {
	table: string
	asset: Asset
	startDate: string
	endDate: string
	binInterval: string
}

export const useAssetHistory = <Item extends Record<string, any>>({
	query: queryFn,
	disabled,
}: {
	query: (args: QueryFnArgs) => string
	disabled?: boolean
}): Item[] => {
	const [history, setHistory] = useState<Item[]>([])
	const {
		range: { start: startDate, end: endDate },
		binInterval,
	} = useChartDateRange()
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
		[startDate, endDate, binInterval, queryFn],
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
