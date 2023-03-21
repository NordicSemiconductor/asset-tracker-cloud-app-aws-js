import { GNSS } from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'
import { fetchRoamingData } from 'api/fetchRoamingData'
import { timeStreamFormatDate } from 'api/timestream'
import { SensorProperties, type Asset } from 'asset/asset'
import type { DateRange } from 'hooks/useChartDateRange'
import { AssetGeoLocationSource, type AssetGeoLocation } from 'hooks/useMapData'
import { useServices } from 'hooks/useServices'
import {
	createContext,
	useContext,
	type FunctionComponent,
	type ReactNode,
} from 'react'
import { validFilter } from 'utils/validFilter'

const validGNSSReadingFilter = validFilter(GNSS)

export const AssetLocationHistoryContext = createContext<{
	history: (args: {
		asset: Asset
		range: DateRange
		limit: number
	}) => Promise<AssetGeoLocation[]>
}>({
	history: async () => [],
})

export const useAssetLocationHistory = () =>
	useContext(AssetLocationHistoryContext)

export const AssetLocationHistoryProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const { timestream } = useServices()

	const history = async ({
		limit,
		range: { start: startDate, end: endDate },
		asset,
	}: {
		asset: Asset
		range: DateRange
		limit: number
	}): Promise<AssetGeoLocation[]> => {
		if (asset === undefined) return []
		const data = await timestream.query<{
			objectValues: number[]
			objectKeys: string[]
			objectSource: string[]
			date: Date
		}>(
			(table) => `SELECT
				array_agg(measure_value::double) AS objectValues,
				array_agg(measure_name) AS objectKeys,
				array_agg(source) AS objectSource,
				date_trunc('second', time) as date
				FROM ${table}
				WHERE deviceId='${asset.id}' 
				AND measureGroup IN (
					SELECT
					measureGroup
					FROM ${table}
					WHERE deviceId='${asset.id}' 
					AND substr(measure_name, 1, ${SensorProperties.GNSS.length + 1}) = '${
				SensorProperties.GNSS
			}.'
					GROUP BY measureGroup, time
					ORDER BY time DESC
				)
				AND substr(measure_name, 1, ${SensorProperties.GNSS.length + 1}) = '${
				SensorProperties.GNSS
			}.'
				AND date_trunc('second', time) >= '${timeStreamFormatDate(startDate)}'
				AND date_trunc('second', time) <= '${timeStreamFormatDate(endDate)}'
				GROUP BY measureGroup, time
				ORDER BY time DESC
				LIMIT ${limit}
				`,
		)

		// Validate the GNSS position data
		const locations: Omit<AssetGeoLocation, 'roaming'>[] = data
			.filter(({ objectValues, objectKeys, date }) =>
				validGNSSReadingFilter({
					v: objectKeys.reduce(
						(obj, k, i) => ({
							...obj,
							[k.split('.')[1]]: objectValues[i],
						}),
						{} as any,
					),
					ts: date.getTime(),
				}),
			)
			// Build the object with info whether the data came from a batch message
			.map(({ objectValues, objectKeys, date, objectSource }) => {
				const pos = objectKeys.reduce(
					(obj, k, i) => ({
						...obj,
						[k.split('.')[1]]: {
							v: objectValues[i],
							source: objectSource[i],
						},
					}),
					{} as {
						lat: {
							v: number
							source?: 'batch'
						}
						lng: {
							v: number
							source?: 'batch'
						}
						acc: {
							v: number
							source?: 'batch'
						}
						alt: {
							v: number
							source?: 'batch'
						}
						hdg: {
							v: number
							source?: 'batch'
						}
						spd: {
							v: number
							source?: 'batch'
						}
					},
				)

				const l: Omit<AssetGeoLocation, 'roaming'> = {
					location: {
						position: {
							lat: pos.lat.v,
							lng: pos.lng.v,
							accuracy: pos.acc.v,
							heading: pos.hdg.v,
							altitude: pos.alt.v,
							speed: pos.spd.v,
						},
						batch: [
							pos.lat.source,
							pos.lng.source,
							pos.acc.source,
							pos.hdg.source,
							pos.alt.source,
							pos.spd.source,
						].includes('batch'),
						ts: date,
						source: AssetGeoLocationSource.GNSS,
					},
				}
				return l
			})
			.filter((l) => l)

		if (locations.length === 0) return []

		const sortedRoaming = await fetchRoamingData({
			timestream,
			asset,
			start: locations[locations.length - 1].location.ts,
			end: locations[0].location.ts,
		})

		// Interleave the roaming information with the location data
		const history = locations.map(({ location }) => ({
			location,
			roaming: sortedRoaming.find(({ ts }) => ts <= location.ts.getTime()), // Find the first roaming entry that is older than the location
		}))

		return history
	}

	return (
		<AssetLocationHistoryContext.Provider
			value={{
				history,
			}}
		>
			{children}
		</AssetLocationHistoryContext.Provider>
	)
}
