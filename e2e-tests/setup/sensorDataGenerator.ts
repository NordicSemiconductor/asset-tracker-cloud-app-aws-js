import {
	TimestreamWriteClient,
	WriteRecordsCommand,
	_Record,
} from '@aws-sdk/client-timestream-write'
import { toRecord } from '@nordicsemiconductor/timestream-helpers'
import { AssetHistory, AssetHistoryDatum, Battery } from 'asset/asset'
import { ulid } from '../../src/utils/ulid.js'

function* batteryGenerator(
	min = 3000,
	max = 4500,
	intervalSeconds = 3600,
	step = 100,
): Generator<AssetHistoryDatum<Battery>> {
	let i = 0
	let v = min
	while (true) {
		yield {
			ts: Date.now() - i * intervalSeconds * 1000,
			v,
		}
		v += step
		if (v > max || v < min) {
			step = -step
		}
		i++
	}
}

const writeHistoricalDataForDevice = async ({
	deviceId,
	data,
	sensor,
	DatabaseName,
	TableName,
}: {
	deviceId: string
	data: AssetHistory<any>
	sensor: 'bat'
	DatabaseName: string
	TableName: string
}) => {
	const client = new TimestreamWriteClient({})
	await client.send(
		new WriteRecordsCommand({
			DatabaseName,
			TableName,
			Records: data
				.map((d) =>
					toRecord({
						name: sensor,
						ts: d.ts,
						v: d.v,
						dimensions: {
							measureGroup: ulid(),
							deviceId,
						},
					}),
				)
				.filter((d) => d !== undefined) as _Record[],
		}),
	)
}

export const generateBatteryReadings = async ({
	thingName,
	DatabaseName,
	TableName,
}: {
	thingName: string
	DatabaseName: string
	TableName: string
}): Promise<void> => {
	const batteryReadings: AssetHistory<Battery> = []
	const b = batteryGenerator()
	for (let i = 0; i < 24; i++) {
		batteryReadings.push(b.next().value)
	}
	await writeHistoricalDataForDevice({
		DatabaseName,
		TableName,
		deviceId: thingName,
		data: batteryReadings,
		sensor: 'bat',
	})
}
