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
import { ReportedSensor, Roaming } from 'asset/asset.js'
import { promises as fs } from 'fs'
import id128 from 'id128'
import * as path from 'path'
import {
	ncellmeasDeviceReport,
	ncellmeasDeviceReportLocation,
	state,
} from './asset-reported-state.js'
import { generateBatteryReadings } from './setup/sensorDataGenerator.js'

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

const globalSetup = async () => {
	// Create Asset Tracker
	const words = await randomWords({ numWords: 3 })
	const name = words.join('-')
	const thingName = `web-app-ci-${name}`
	console.debug(`Creating device`, thingName)

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
	await iotData.send(
		new UpdateThingShadowCommand({
			thingName,
			payload: fromUtf8(
				JSON.stringify({
					state: {
						reported: state,
					},
				}),
			),
		}),
	)

	const db = new DynamoDBClient({})

	// Store cell geo location
	console.log(`Storing cell geo location`)
	const roam = state.roam as ReportedSensor<Roaming>
	await db.send(
		new PutItemCommand({
			TableName: cellGeoLocationCacheTableName,
			Item: marshall({
				cellId: cellId({
					...roam.v,
					nw: roam.v.nw.includes('NB-IoT')
						? NetworkMode.NBIoT
						: NetworkMode.LTEm,
				}),
				ttl: Math.floor(Date.now() / 1000) + 30 * 24 * 60,
				lat: 63.421133000000026,
				lng: 10.436642000000063,
				accuracy: 5000,
			}),
		}),
	)

	// Publish neighboring cell measurement
	const report = {
		reportId: id128.Uuid4.generate().toCanonical(),
		nw: state.roam?.v.nw,
		deviceId: thingName,
		report: ncellmeasDeviceReport,
		timestamp: Date.now().toString(),
		unresolved: false,
		...ncellmeasDeviceReportLocation,
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
	console.log(`Generating battery readings ...`)
	await generateBatteryReadings({
		thingName,
		DatabaseName,
		TableName,
	})

	try {
		await fs.stat(path.join(process.cwd(), 'test-session'))
	} catch {
		await fs.mkdir(path.join(process.cwd(), 'test-session'))
	}

	await fs.writeFile(
		path.join(process.cwd(), 'test-session', 'asset.json'),
		JSON.stringify({ thingArn, thingId, thingName, name }),
		'utf-8',
	)
}

try {
	await globalSetup()
} catch (error) {
	console.error(error)
	process.exit(1)
}
