import {
	TimestreamWriteClient,
	WriteRecordsCommand,
	_Record,
} from '@aws-sdk/client-timestream-write'
import { toRecord } from '@nordicsemiconductor/timestream-helpers'
import { SensorProperties } from '../../src/asset/asset.js'
import { ulid } from '../../src/utils/ulid.js'
import { AssetType } from '../authenticated/lib.js'
import { state } from './asset-reported-state.js'

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
	let i = 1
	let v = min
	while (true) {
		yield {
			ts: Date.now() - i * (intervalSeconds ?? 3600) * 1000,
			v,
		}
		v += step
		if (v >= max || v <= min) {
			step = -step
		}
		i++
	}
}

const writeHistoricalDataForAsset = async ({
	deviceId,
	data,
	sensor,
	DatabaseName,
	TableName,
	client,
}: {
	deviceId: string
	data: { ts: number; v: any }[]
	sensor: string
	DatabaseName: string
	TableName: string
	client: TimestreamWriteClient
}) => {
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

export const storeSensorUpdate =
	({
		type,
		client,
		DatabaseName,
		TableName,
		thingName,
	}: {
		type: AssetType
		client: TimestreamWriteClient
		DatabaseName: string
		TableName: string
		thingName: string
	}) =>
	async ({
		v,
		batch,
		ts,
		sensor,
	}: {
		v: Record<string, any>
		batch?: boolean
		ts: number
		sensor: SensorProperties
	}): Promise<void> => {
		if (sensor === SensorProperties.GNSS && type === AssetType.NoGNSS) return
		const measureGroup = ulid()
		await client.send(
			new WriteRecordsCommand({
				DatabaseName,
				TableName,
				Records: Object.entries(v)
					.map(([k, v]) => {
						const dimensions: Record<string, string> = {
							measureGroup,
							deviceId: thingName,
						}
						if (batch === true) dimensions.source = 'batch'
						return toRecord({
							name: `${sensor}.${k}`,
							ts,
							v: v,
							dimensions,
						})
					})
					.filter((d) => d !== undefined) as _Record[],
			}),
		)
	}

/**
 * Prepares data in timestream for querying
 */
export const timestreamDataGenerator = async ({
	type,
	thingName,
	DatabaseName,
	TableName,
}: {
	type: AssetType
	thingName: string
	DatabaseName: string
	TableName: string
}): Promise<void> => {
	const client = new TimestreamWriteClient({})
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
		await writeHistoricalDataForAsset({
			DatabaseName,
			TableName,
			deviceId: thingName,
			data,
			sensor,
			client,
		})
	}

	await Promise.all([
		// Battery
		generateReadings({
			min: 3000,
			max: 4500,
			step: 100,
			sensor: SensorProperties.Battery,
		}),
		// RSRP
		generateReadings({
			min: -120,
			max: -90,
			step: 5,
			sensor: `${SensorProperties.Roaming}.rsrp`,
		}),
		// Temperature
		generateReadings({
			min: 15,
			max: 25,
			step: 1,
			sensor: `${SensorProperties.Environment}.temp`,
		}),
		// Button presses
		generateReadings({
			min: 1,
			max: 4,
			step: 1,
			sensor: SensorProperties.Button,
		}),
		// Impacts
		// TODO: this should be randomized, instead of creating linear impacts
		generateReadings({
			min: 0,
			max: 300,
			step: 1,
			sensor: SensorProperties.Impact,
		}),
		// Location data
		(async () => {
			const locationCommon = {
				acc: 50,
				spd: 10,
				alt: 120,
			} as const
			const now = Date.now()
			await Promise.all(
				[
					{
						v: {
							...state.roam.v,
							cell: 18933760,
							area: 31801,
							mccmnc: 24201,
						},
						ts: now - 12 * 60 * 1000,
						sensor: SensorProperties.Roaming,
					},
					{
						v: {
							...locationCommon,
							lat: 63.40916157841286,
							lng: 10.441174507141115,
							hdg: 300.1156519268349,
						},
						ts: now - 10 * 60 * 1000,
						sensor: SensorProperties.GNSS,
					},
					{
						v: {
							...locationCommon,
							lat: 63.409661023646464,
							lng: 10.437912940979006,
							hdg: 288.88754565598094,
						},
						ts: now - 9 * 60 * 1000,
						sensor: SensorProperties.GNSS,
					},
					{
						v: {
							...locationCommon,
							lat: 63.41081355637559,
							lng: 10.435166358947756,
							hdg: 313.1536177674987,
						},
						ts: now - 8 * 60 * 1000,
						sensor: SensorProperties.GNSS,
					},
					{
						v: {
							...locationCommon,
							lat: 63.41277275571861,
							lng: 10.433020591735842,
							hdg: 333.88704677838643,
						},
						batch: true,
						ts: now - 7 * 60 * 1000,
						sensor: SensorProperties.GNSS,
					},
					{
						v: {
							...locationCommon,
							lat: 63.41503911345973,
							lng: 10.431389808654787,
							hdg: 342.1504108601344,
						},
						batch: true,
						ts: now - 6 * 60 * 1000,
						sensor: SensorProperties.GNSS,
					},
					{
						v: {
							...locationCommon,
							lat: 63.416613934537054,
							lng: 10.432934761047365,
							hdg: 23.701955150454694,
						},
						batch: true,
						ts: now - 5 * 60 * 1000,
						sensor: SensorProperties.GNSS,
					},
					{
						v: {
							...locationCommon,
							lat: 63.41868795714419,
							lng: 10.435423851013185,
							hdg: 28.2363325683624,
						},
						ts: now - 4 * 60 * 1000,
						sensor: SensorProperties.GNSS,
					},
					{
						v: {
							rsrp: -99,
						},
						ts: Math.round(now - 3.5 * 60 * 1000),
						sensor: SensorProperties.Roaming,
					},
					{
						v: {
							...locationCommon,
							lat: 63.42045459880157,
							lng: 10.437912940979006,
							hdg: 32.227644444091936,
						},
						ts: now - 3 * 60 * 1000,
						sensor: SensorProperties.GNSS,
					},
					{
						v: {
							...locationCommon,
							lat: 63.42087704045939,
							lng: 10.435595512390138,
							hdg: 292.16738207601514,
						},
						ts: now - 2 * 60 * 1000,
						sensor: SensorProperties.GNSS,
					},
				].map(
					storeSensorUpdate({
						client,
						DatabaseName,
						TableName,
						thingName,
						type,
					}),
				),
			)
		})(),
	])
}
