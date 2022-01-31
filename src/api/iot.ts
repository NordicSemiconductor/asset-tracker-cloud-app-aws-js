import {
	DeleteThingCommand,
	DescribeThingCommand,
	IoTClient,
	ListThingsCommand,
	ThingAttribute,
} from '@aws-sdk/client-iot'
import type { Asset } from 'asset/Asset'

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
	getThing: (thingName: string) => Promise<Asset>
	deleteThing: (thingName: string) => Promise<void>
	listThings: (options?: { limit?: number; startKey?: string }) => Promise<{
		things: ThingAttribute[]
		nextStartKey?: string
	}>
}

export const iotService = ({ iot }: { iot: IoTClient }): IoTService => ({
	getThing: async (thingName: string) =>
		iot
			.send(
				new DescribeThingCommand({
					thingName,
				}),
			)
			.then(({ thingName, attributes }) => ({
				id: thingName as string,
				name: (attributes?.name ?? thingName) as string,
			})),
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
