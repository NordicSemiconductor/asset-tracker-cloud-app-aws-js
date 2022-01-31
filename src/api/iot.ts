import {
	DeleteThingCommand,
	DescribeThingCommand,
	IoTClient,
	ListThingsCommand,
	ThingAttribute,
} from '@aws-sdk/client-iot'
import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import type { AssetWithTwin } from 'asset/Asset'
import type { AssetTwin } from 'asset/state'

const filterTestThings = (things: ThingAttribute[]): ThingAttribute[] =>
	things.filter((thing) => thing.attributes?.test === undefined)

const listThings =
	({ iot }: { iot: IoTClient }) =>
	async ({
		items,
		limit,
		startKey,
	}: {
		items?: ThingAttribute[]
		limit: number
		startKey?: string
	}): Promise<{
		things: ThingAttribute[]
		nextStartKey?: string
	}> => {
		const { things, nextToken } = await iot.send(
			new ListThingsCommand({
				nextToken: startKey,
				maxResults: limit,
			}),
		)
		if (things === undefined)
			return { things: items ?? [], nextStartKey: startKey }
		const newItems = [...(items ?? []), ...filterTestThings(things ?? [])]
		if (nextToken === undefined || newItems.length >= limit)
			return { things: newItems, nextStartKey: nextToken }
		return listThings({ iot })({
			items: newItems,
			limit,
			startKey: nextToken,
		})
	}

export type IoTService = {
	getThing: (thingName: string) => Promise<AssetWithTwin>
	deleteThing: (thingName: string) => Promise<void>
	listThings: (options?: { limit?: number; startKey?: string }) => Promise<{
		things: ThingAttribute[]
		nextStartKey?: string
	}>
}

export const iotService = ({
	iot,
	iotData,
}: {
	iot: IoTClient
	iotData: IoTDataPlaneClient
}): IoTService => ({
	getThing: async (thingName: string) =>
		Promise.all([
			iot.send(
				new DescribeThingCommand({
					thingName,
				}),
			),
			iotData.send(
				new GetThingShadowCommand({
					thingName,
				}),
			),
		]).then(([{ thingName, attributes }, { payload }]) => {
			const twin: AssetTwin = {
				reported: {},
				desired: {},
				metadata: {},
			}
			if (payload !== undefined) {
				const shadow = JSON.parse(toUtf8(payload))
				if (shadow.state !== undefined) {
					twin.reported = shadow.state.reported
					twin.desired = shadow.state.desired
					twin.metadata = shadow.metadata
				}
			}

			return {
				asset: {
					id: thingName as string,
					name: (attributes?.name ?? thingName) as string,
				},
				twin,
			}
		}),
	deleteThing: async (thingName: string) => {
		await iot.send(
			new DeleteThingCommand({
				thingName,
			}),
		)
	},
	listThings: async (options) =>
		listThings({ iot })({
			limit: options?.limit ?? 25,
			startKey: options?.startKey,
		}),
})
