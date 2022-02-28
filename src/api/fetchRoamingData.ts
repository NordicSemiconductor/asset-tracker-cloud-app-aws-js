import type { Static } from '@sinclair/typebox'
import { Asset, Roaming, SensorProperties } from 'asset/asset'
import { validateWithJSONSchema } from 'utils/validateWithJSONSchema'
import { validFilter } from 'utils/validFilter'
import { timeStreamFormatDate, TimestreamService } from './timestream'

const validateRoamingReading = validateWithJSONSchema(Roaming)
const validRoamingReadingFilter = validFilter(Roaming)

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
}): Static<typeof Roaming> => ({
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
}): Promise<Static<typeof Roaming>[]> => {
	// So, first, build the state of the asset's roaming information,
	// before the first location by fetching 100 updates older than that.
	const olderRoamingData = await timestream.query<{
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
			`time as date`,
			`FROM ${table}`,
			`WHERE deviceId='${asset.id}'`,
			`AND substr(measure_name, 1, ${SensorProperties.Roaming.length + 1}) = '${
				SensorProperties.Roaming
			}.'`,
			// Get the roaming updates *before* the first position
			`AND time < '${timeStreamFormatDate(start)}'`,
			`GROUP BY measureGroup, time`,
			// Sort descending so we can build the roaming object back starting with the latest update
			`ORDER BY time DESC`,
			// we have to stop somewhere, in case there was never a full update
			// (according to what the web applications considers a full update, that is)
			`LIMIT 100`,
		].join('\n'),
	)

	// Build up the roaming reading by adding properties from updates to the object, until it is valid
	const firstRoam = olderRoamingData.reduce((roaming, data) => {
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
	}, {} as Static<typeof Roaming>)

	if (firstRoam === undefined) {
		console.debug(
			'[useAssetLocationHistory]',
			`No valid roaming information found.`,
		)
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
			`time as date`,
			`FROM ${table}`,
			`WHERE deviceId='${asset.id}'`,
			`AND substr(measure_name, 1, ${SensorProperties.Roaming.length + 1}) = '${
				SensorProperties.Roaming
			}.'`,
			`AND time >= '${timeStreamFormatDate(start)}'`,
			`AND time <= '${timeStreamFormatDate(end)}'`,
			`GROUP BY measureGroup, time`,
			`ORDER BY time DESC`,
		].join('\n'),
	)

	// Merge the updates with the one full update, and storing them as new full roaming states
	const roaming: Static<typeof Roaming>[] = [firstRoam]
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
