import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { expect } from '@playwright/test'

/**
 * Implements AWS IoT Thing Shadow verification with a retry mechanism, since the shadow is eventual consistent
 */
export const verifyShadow = async (
	thingName: string,
	iotDataPlaneClient: IoTDataPlaneClient,
	onShadow: (shadow: any) => unknown,
	options = { tries: 5, initialDelay: 1000, delay: 5000 },
): Promise<void> => {
	await new Promise((resolve) => setTimeout(resolve, options.initialDelay))
	return tryVerifyShadow(thingName, iotDataPlaneClient, onShadow, options)
}

const tryVerifyShadow = async (
	thingName: string,
	iotDataPlaneClient: IoTDataPlaneClient,
	onShadow: (shadow: any) => unknown,
	options = { tries: 3, delay: 1000 },
	currentTry = 1,
): Promise<void> => {
	try {
		const { payload } = await iotDataPlaneClient.send(
			new GetThingShadowCommand({
				thingName,
			}),
		)
		expect(payload).not.toBeUndefined()
		const shadow = JSON.parse(toUtf8(payload as Uint8Array))
		onShadow(shadow)
	} catch (err) {
		console.error(`verifyShadow`, `try`, currentTry, (err as Error).message)
		if (currentTry < options.tries) {
			console.error(`verifyShadow`, `waiting`, options.delay)
			await new Promise((resolve) => setTimeout(resolve, options.delay))
			return tryVerifyShadow(
				thingName,
				iotDataPlaneClient,
				onShadow,
				{ ...options, delay: options.delay * 2 },
				currentTry + 1,
			)
		}
		throw err
	}
}
