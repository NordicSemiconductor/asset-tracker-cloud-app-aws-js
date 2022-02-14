import {
	TimestreamWriteClient,
	WriteRecordsCommand,
	_Record,
} from '@aws-sdk/client-timestream-write'
import { toRecord } from '@nordicsemiconductor/timestream-helpers'
import { SensorProperties } from '../../src/asset/asset.js'
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

export const readingsGenerator = async ({
	thingName,
	DatabaseName,
	TableName,
}: {
	thingName: string
	DatabaseName: string
	TableName: string
}): Promise<void> => {
	const generateReadings = async ({
		min,
		max,
		step,
		sensor,
	}: {
		min: number
		max: number
		step: number
		sensor: string
	}): Promise<void> => {
		const data: { ts: number; v: number }[] = []
		const b = dataGenerator({
			min,
			max,
			step,
		})
		for (let i = 0; i < 24; i++) {
			data.push(b.next().value)
		}
		await writeHistoricalDataForDevice({
			DatabaseName,
			TableName,
			deviceId: thingName,
			data,
			sensor,
		})
	}

	await Promise.all([
		generateReadings({
			min: 3000,
			max: 4500,
			step: 100,
			sensor: SensorProperties.Battery,
		}),
		generateReadings({
			min: -120,
			max: -90,
			step: 5,
			sensor: `${SensorProperties.Roaming}.rsrp`,
		}),
		generateReadings({
			min: 15,
			max: 25,
			step: 1,
			sensor: `${SensorProperties.Environment}.temp`,
		}),
	])
}
