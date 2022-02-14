import {
	TimestreamWriteClient,
	WriteRecordsCommand,
	_Record,
} from '@aws-sdk/client-timestream-write'
import { toRecord } from '@nordicsemiconductor/timestream-helpers'
import {
	AssetHistory,
	Battery,
	Roaming,
	SensorProperties,
} from '../../src/asset/asset.js'
import { ulid } from '../../src/utils/ulid.js'

function* dataGenerator({
	min,
	max,
	intervalSeconds,
	step,
}: {
	min: number
	max: number
	intervalSeconds?: number
	step: number
}): Generator<{ ts: number; v: number }> {
	let i = 0
	let v = min
	while (true) {
		yield {
			ts: Date.now() - i * (intervalSeconds ?? 3600) * 1000,
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
	data: { ts: number; v: any }[]
	sensor: string
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
	const b = dataGenerator({
		min: 3000,
		max: 4500,
		step: 100,
	})
	for (let i = 0; i < 24; i++) {
		batteryReadings.push(b.next().value)
	}
	await writeHistoricalDataForDevice({
		DatabaseName,
		TableName,
		deviceId: thingName,
		data: batteryReadings,
		sensor: SensorProperties.Battery,
	})
}

export const generateRSRPReadings = async ({
	thingName,
	DatabaseName,
	TableName,
}: {
	thingName: string
	DatabaseName: string
	TableName: string
}): Promise<void> => {
	const roamingReadings: AssetHistory<Roaming> = []
	const b = dataGenerator({
		min: -120,
		max: -90,
		step: 5,
	})
	for (let i = 0; i < 24; i++) {
		const { v: rsrp, ts } = b.next().value
		roamingReadings.push({
			ts,
			v: rsrp,
		})
	}
	await writeHistoricalDataForDevice({
		DatabaseName,
		TableName,
		deviceId: thingName,
		data: roamingReadings,
		sensor: `${SensorProperties.Roaming}.rsrp`,
	})
}
