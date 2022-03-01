import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { CreateThingCommand, IoTClient } from '@aws-sdk/client-iot'
import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { marshall } from '@aws-sdk/util-dynamodb'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'
import {
	cellId,
	NetworkMode,
} from '@nordicsemiconductor/cell-geolocation-helpers'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { randomWords } from '@nordicsemiconductor/random-words'
import { promises as fs } from 'fs'
import id128 from 'id128'
import * as path from 'path'
import {
	ncellmeasReport,
	ncellmeasReportLocation,
	state,
} from './asset-reported-state.js'
import { AssetType } from './authenticated/lib.js'
import { timestreamDataGenerator } from './setup/sensorDataGenerator.js'

const {
	mqttEndpoint,
	neighborCellMeasurementsStorageTable,
	cellGeoLocationCacheTableName,
	historicaldataTableInfo,
} = fromEnv({
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
	neighborCellMeasurementsStorageTable: 'PUBLIC_NCELLMEAS_STORAGE_TABLE_NAME',
	cellGeoLocationCacheTableName: 'PUBLIC_CELL_GEO_LOCATION_CACHE_TABLE_NAME',
	historicaldataTableInfo: 'PUBLIC_HISTORICALDATA_TABLE_INFO',
})(process.env)

const globalSetup = async (type: AssetType) => {
	// Create Asset Tracker
	const words = await randomWords({ numWords: 3 })
	const name = words.join('-')
	const thingName = `web-app-ci-${name}`
	console.debug(`Creating asset`, type, thingName)

	const { thingArn, thingId } = await new IoTClient({}).send(
		new CreateThingCommand({
			thingName,
			attributePayload: {
				attributes: {
					name,
				},
			},
		}),
	)

	const iotData = new IoTDataPlaneClient({
		endpoint: `https://${mqttEndpoint}`,
	})

	// Report configuration
	const reportedState: Record<string, any> = { ...state }
	if (type === AssetType.NoGNSS) reportedState.gnss = undefined
	await iotData.send(
		new UpdateThingShadowCommand({
			thingName,
			payload: fromUtf8(
				JSON.stringify({
					state: {
						reported: reportedState,
					},
				}),
			),
		}),
	)

	const db = new DynamoDBClient({})

	// Store cell geo location
	console.log(`Storing cell geo location`)
	const roam = state.roam
	await Promise.all([
		db.send(
			new PutItemCommand({
				TableName: cellGeoLocationCacheTableName,
				Item: marshall({
					cellId: cellId({
						area: 30401,
						mccmnc: 24201,
						cell: 30976,
						nw: NetworkMode.LTEm,
					}),
					ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60,
					lat: 63.421133000000026,
					lng: 10.436642000000063,
					accuracy: 5000,
				}),
			}),
		),
		db.send(
			new PutItemCommand({
				TableName: cellGeoLocationCacheTableName,
				Item: marshall({
					cellId: cellId({
						cell: 18933760,
						area: 31801,
						mccmnc: 24201,
						nw: NetworkMode.LTEm,
					}),
					ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60,
					lat: 63.79018114489696,
					lng: 11.49213362240647,
					accuracy: 5000,
				}),
			}),
		),
	])

	// Publish neighboring cell measurement
	const report = {
		reportId: id128.Uuid4.generate().toCanonical(),
		nw: roam.v.nw,
		deviceId: thingName,
		report: ncellmeasReport,
		timestamp: Date.now().toString(),
		unresolved: false,
		...ncellmeasReportLocation,
	}
	console.log(`Storing neighboring cell report`)
	await db.send(
		new PutItemCommand({
			TableName: neighborCellMeasurementsStorageTable,
			Item: marshall(report),
		}),
	)

	// Historical sensor data
	const [DatabaseName, TableName] = historicaldataTableInfo.split('|')
	console.log(`Generating sensor readings ...`)
	await timestreamDataGenerator({
		thingName,
		DatabaseName,
		TableName,
		type,
	})

	try {
		await fs.stat(path.join(process.cwd(), 'test-session'))
	} catch {
		await fs.mkdir(path.join(process.cwd(), 'test-session'))
	}

	await fs.writeFile(
		path.join(process.cwd(), 'test-session', `${type}.json`),
		JSON.stringify({ thingArn, thingId, thingName, name }),
		'utf-8',
	)
}

try {
	await globalSetup(AssetType.Default)
	await globalSetup(AssetType.NoGNSS)
} catch (error) {
	console.error(error)
	process.exit(1)
}
