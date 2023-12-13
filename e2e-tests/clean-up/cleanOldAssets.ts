/**
 * This cleans up all old web app CI things
 */
import {
	DeleteThingCommand,
	IoTClient,
	ListThingsCommand,
} from '@aws-sdk/client-iot'
import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { paginate } from '../../src/utils/paginate.js'

export const listWebAppCIThings =
	({
		iot,
		iotData,
		ageInHours,
	}: {
		iot: IoTClient
		iotData: IoTDataPlaneClient
		ageInHours: number
	}) =>
	async (): Promise<string[]> =>
		paginate<string>({
			paginator: async (startKey) => {
				const { things, nextToken } = await iot.send(
					new ListThingsCommand({
						nextToken: startKey,
					}),
				)

				if (things === undefined || things === null) {
					return {
						items: [],
						nextStartKey: nextToken,
					}
				}

				const webAppThings = things
					// Only return Things created for the Web App CI tests
					.filter(({ thingName }) => thingName?.startsWith('web-app-ci-'))

				if (webAppThings.length === 0)
					return {
						items: [],
						nextStartKey: nextToken,
					}

				const thingsWithShadow = await Promise.all(
					webAppThings.map(async (thing) => {
						try {
							const shadow = await iotData.send(
								new GetThingShadowCommand({
									thingName: thing.thingName,
								}),
							)
							return {
								thing,
								shadow,
							}
						} catch {
							return {
								thing,
								shadow: undefined,
							}
						}
					}),
				)
				return {
					items:
						// Only delete devices older than 24 hours
						thingsWithShadow
							.filter(({ shadow }) =>
								shadow?.payload !== undefined
									? JSON.parse(toUtf8(shadow.payload))?.timestamp ??
										Date.now() / 1000 > Date.now() - ageInHours * 60 * 60 * 1000
									: false,
							)
							.map(({ thing: { thingName } }) => thingName as string),
					nextStartKey: nextToken,
				}
			},
		})

const iot = new IoTClient({})
const thingsToDelete = await listWebAppCIThings({
	iot,
	iotData: new IoTDataPlaneClient({}),
	ageInHours: Math.min(0, parseInt(process.env.AGE ?? '24', 10)),
})()

if (thingsToDelete.length > 0) {
	console.log('Deleting...', thingsToDelete)

	await Promise.all(
		thingsToDelete.map(async (thingName) =>
			iot.send(new DeleteThingCommand({ thingName })),
		),
	)
}
