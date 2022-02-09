import { DynamoDBClient, PutItemCommand } from '@aws-sdk/client-dynamodb'
import { CreateThingCommand, IoTClient } from '@aws-sdk/client-iot'
import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { marshall } from '@aws-sdk/util-dynamodb'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { randomWords } from '@nordicsemiconductor/random-words'
import { promises as fs } from 'fs'
import id128 from 'id128'
import * as path from 'path'
import {
	ncellmeasDeviceReport,
	ncellmeasDeviceReportLocation,
	state,
} from './asset-reported-state.js'

const { mqttEndpoint, neighborCellMeasurementsStorageTable } = fromEnv({
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
	neighborCellMeasurementsStorageTable: 'PUBLIC_NCELLMEAS_STORAGE_TABLE_NAME',
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

	// Publish neighboring cell measurement
	const db = new DynamoDBClient({})

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
