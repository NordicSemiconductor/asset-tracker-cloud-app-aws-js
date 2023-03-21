import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { CreateThingCommand, IoTClient } from '@aws-sdk/client-iot'
import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { TimestreamWriteClient } from '@aws-sdk/client-timestream-write'
import { marshall } from '@aws-sdk/util-dynamodb'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'
import {
	NetworkMode,
	cellId,
} from '@nordicsemiconductor/cell-geolocation-helpers'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { randomWords } from '@nordicsemiconductor/random-words'
import { promises as fs } from 'fs'
import * as path from 'path'
import { SensorProperties } from '../../src/asset/asset.js'
import { AssetType } from '../authenticated/lib.js'
import { state } from './asset-reported-state.js'
import { networkSurveys } from './networkSurveys.js'
import {
	storeSensorUpdate,
	timestreamDataGenerator,
} from './sensorDataGenerator.js'

const {
	mqttEndpoint,
	networkSurveyStorageTable,
	cellGeoLocationCacheTableName,
	historicaldataTableInfo,
} = fromEnv({
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
	networkSurveyStorageTable: 'PUBLIC_NETWORKSURVEY_STORAGE_TABLE_NAME',
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
	const surveys = networkSurveys({ thingName })
	console.log(`Storing neighboring cell report`)
	await Promise.all(
		surveys.map(async (survey) =>
			db.send(
				new PutItemCommand({
					TableName: networkSurveyStorageTable,
					Item: marshall(survey),
				}),
			),
		),
	)

	// Historical sensor data
	const [DatabaseName, TableName] = historicaldataTableInfo.split('|')
	console.log(`Storing shadow in Timestream ...`)
	const s = storeSensorUpdate({
		DatabaseName,
		TableName,
		client: new TimestreamWriteClient({}),
		thingName,
		type,
	})
	await s({ ...state.roam, sensor: SensorProperties.Roaming })
	await s({ ...state.gnss, sensor: SensorProperties.GNSS })
	await s({ ...state.env, sensor: SensorProperties.Environment })
	await s({ ...state.dev, sensor: SensorProperties.Asset })

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
