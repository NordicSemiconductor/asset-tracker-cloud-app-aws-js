import {
	RoamingInfo,
	type RoamingInfoData,
} from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'
import { timeStreamFormatDate, type TimestreamService } from 'api/timestream'
import { SensorProperties, type Asset } from 'asset/asset'
import { validateWithJSONSchema } from 'utils/validateWithJSONSchema'
import { validFilter } from 'utils/validFilter'

const validateRoamingReading = validateWithJSONSchema(RoamingInfo)
const validRoamingReadingFilter = validFilter(RoamingInfo)

const toRoam = ({
	objectValuesDouble,
	objectValuesVarchar,
	objectKeys,
	date,
}: {
	objectValuesDouble: number[]
	objectValuesVarchar: string[]
	objectKeys: string[]
	date: Date
}): RoamingInfoData => ({
	v: objectKeys.reduce(
		(obj, k, i) => ({
			...obj,
			[k.split('.')[1]]: objectValuesDouble[i] ?? objectValuesVarchar[i],
		}),
		{},
	) as any,
	ts: date.getTime(),
})

/**
 * Fetch the roaming information for a given time range.
 *
 * Since they are not published by the device
 * in the same message, we have to fetch the data from the same time frame
 * as the location data, and interleave it with the locations.
 *
 * Basically this is what the device reports:
 * > Roaming
 * > GNSS
 * > GNSS
 * > GNSS
 * > GNSS
 * > Roaming
 * > GNSS
 * > GNSS
 * > GNSS
 * > GNSS
 * > GNSS
 * > Roaming
 * > ...
 *
 * So the roaming information for the GNSS reading in the result is
 * always the one reported *before* it.
 *
 * Because the device can report partial updates, we need to build the
 * Roaming information from potentially multiple updates.
 */
export const fetchRoamingData = async ({
	timestream,
	asset,
	start,
	end,
}: {
	asset: Asset
	start: Date
	end: Date
	timestream: TimestreamService
}): Promise<RoamingInfoData[]> => {
	// So, first, build the state of the asset's roaming information,
	// before the first location by fetching 100 updates older than that.
	const olderRoamingInfoData = await timestream.query<{
		objectValuesDouble: number[]
		objectValuesVarchar: string[]
		objectKeys: string[]
		date: Date
	}>((table) =>
		[
			`SELECT`,
			`array_agg(measure_value::double) AS objectValuesDouble,`,
			`array_agg(measure_value::varchar) AS objectValuesVarchar,`,
			`array_agg(measure_name) AS objectKeys,`,
			`date_trunc('second', time) as date`,
			`FROM ${table}`,
			`WHERE deviceId='${asset.id}'`,
			`AND substr(measure_name, 1, ${SensorProperties.Roaming.length + 1}) = '${
				SensorProperties.Roaming
			}.'`,
			// Get the roaming updates *before* the first position
			`AND date_trunc('second', time) <= '${timeStreamFormatDate(start)}'`,
			`GROUP BY measureGroup, time`,
			// Sort descending so we can build the roaming object back starting with the latest update
			`ORDER BY time DESC`,
			// we have to stop somewhere, in case there was never a full update
			// (according to what the web applications considers a full update, that is)
			`LIMIT 100`,
		].join('\n'),
	)

	// In case there is no roaming data older than the first entry to start from,
	// fetch data from the selected date range to build the first full roaming
	// object
	if (olderRoamingInfoData.length === 0) {
		console.debug(
			'[fetchRoamingData]',
			`No previous roaming information found. Fetching data between start and end.`,
		)
	}
	const betweenRoamingInfoData =
		olderRoamingInfoData.length === 0
			? await timestream.query<{
					objectValuesDouble: number[]
					objectValuesVarchar: string[]
					objectKeys: string[]
					date: Date
			  }>((table) =>
					[
						`SELECT`,
						`array_agg(measure_value::double) AS objectValuesDouble,`,
						`array_agg(measure_value::varchar) AS objectValuesVarchar,`,
						`array_agg(measure_name) AS objectKeys,`,
						`date_trunc('second', time) as date`,
						`FROM ${table}`,
						`WHERE deviceId='${asset.id}'`,
						`AND substr(measure_name, 1, ${
							SensorProperties.Roaming.length + 1
						}) = '${SensorProperties.Roaming}.'`,
						// Get the roaming updates *before* the first position
						`AND date_trunc('second', time) >= '${timeStreamFormatDate(
							start,
						)}'`,
						`AND date_trunc('second', time) <= '${timeStreamFormatDate(end)}'`,
						`GROUP BY measureGroup, time`,
						// Sort descending so we can build the roaming object back starting with the latest update
						`ORDER BY time ASC`,
					].join('\n'),
			  )
			: []

	// Build up the roaming reading by adding properties from updates to the object, until it is valid
	let firstRoam: RoamingInfoData | undefined = undefined

	if (olderRoamingInfoData.length > 0 || betweenRoamingInfoData.length > 0)
		firstRoam = [...olderRoamingInfoData, ...betweenRoamingInfoData].reduce(
			(roaming, data) => {
				if (!('errors' in validateRoamingReading(roaming))) return roaming
				const update = toRoam(data)
				const roamingWithUpdate = {
					ts: roaming.ts ?? update.ts,
					v: {
						// Older values will not overwrite newer values
						...update.v,
						...roaming.v,
					},
				}
				return roamingWithUpdate
			},
			{} as RoamingInfoData,
		)

	if (firstRoam === undefined) {
		console.debug(
			'[fetchRoamingData]',
			`Could not determine first full roaming object.`,
		)
		return []
	}

	// Add newer (partial) roaming information, by fetch (partial)
	// roaming updates which are newer than the first one and
	// older than the last one.
	const roamingData = await timestream.query<{
		objectValuesDouble: number[]
		objectValuesVarchar: string[]
		objectKeys: string[]
		date: Date
	}>((table) =>
		[
			`SELECT`,
			`array_agg(measure_value::double) AS objectValuesDouble,`,
			`array_agg(measure_value::varchar) AS objectValuesVarchar,`,
			`array_agg(measure_name) AS objectKeys,`,
			`date_trunc('second', time) as date`,
			`FROM ${table}`,
			`WHERE deviceId='${asset.id}'`,
			`AND substr(measure_name, 1, ${SensorProperties.Roaming.length + 1}) = '${
				SensorProperties.Roaming
			}.'`,
			`AND date_trunc('second', time) >= '${timeStreamFormatDate(
				new Date((firstRoam as RoamingInfoData).ts),
			)}'`,
			`AND date_trunc('second', time) <= '${timeStreamFormatDate(end)}'`,
			`GROUP BY measureGroup, time`,
			`ORDER BY time DESC`,
		].join('\n'),
	)

	// Merge the updates with the one full update, and storing them as new full roaming states
	const roaming: RoamingInfoData[] = [firstRoam]
	for (const update of roamingData.map(toRoam)) {
		roaming.push({
			ts: update.ts,
			v: {
				...roaming[roaming.length - 1].v,
				...update.v,
			},
		})
	}
	return (
		roaming
			// Remove invalid
			.filter(validRoamingReadingFilter)
			// Sort by descending time
			.sort(({ ts: t1 }, { ts: t2 }) => t2 - t1)
	)
}
