import { CreateThingCommand, IoTClient } from '@aws-sdk/client-iot'
import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { randomWords } from '@nordicsemiconductor/random-words'
import { promises as fs } from 'fs'
import * as path from 'path'
import { state } from './asset-reported-state.js'

const { mqttEndpoint } = fromEnv({
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
})(process.env)

const globalSetup = async () => {
	// Create Asset Tracker
	const words = await randomWords({ numWords: 3 })
	const name = words.join('-')
	const thingName = `web-app-ci-${name}`
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

	await new IoTDataPlaneClient({
		endpoint: `https://${mqttEndpoint}`,
	}).send(
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
