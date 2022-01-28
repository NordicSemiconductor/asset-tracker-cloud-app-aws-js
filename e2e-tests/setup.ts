import { CreateThingCommand, IoTClient } from '@aws-sdk/client-iot'
import { randomWords } from '@nordicsemiconductor/random-words'
import { promises as fs } from 'fs'
import * as path from 'path'

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
	console.error(error.message)
	process.exit(1)
}
