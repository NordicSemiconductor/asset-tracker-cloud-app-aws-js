import {
	AttachPolicyCommand,
	DeleteThingCommand,
	DescribeThingCommand,
	IoTClient,
	ListAttachedPoliciesCommand,
	ListThingsCommand,
	ThingAttribute,
	UpdateThingCommand,
} from '@aws-sdk/client-iot'
import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import { fromUtf8, toUtf8 } from '@aws-sdk/util-utf8-browser'
import type { AssetTwin, AssetWithTwin } from 'asset/asset'

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
	attachIotPolicyToIdentity: (args: {
		policyName: string
		identityId: string
	}) => Promise<void>
	updateThing: (thingName: string, { name }: { name: string }) => Promise<void>
	updateShadow: (thingName: string, patch: Partial<AssetTwin>) => Promise<void>
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
			iotData
				.send(
					new GetThingShadowCommand({
						thingName,
					}),
				)
				.catch((err) => {
					if (err.name !== 'ResourceNotFoundException') {
						console.error(`Failed to fetch thing shadow`, err)
					}
					return { payload: undefined }
				}),
		]).then(
			([{ thingName, attributes, version: thingVersion }, { payload }]) => {
				const twin: AssetTwin = {
					reported: {},
					desired: {},
					metadata: {},
					version: -1,
				}
				if (payload !== undefined) {
					const shadow = JSON.parse(toUtf8(payload))
					if (shadow.state !== undefined) {
						twin.reported = shadow.state.reported ?? {}
						twin.desired = shadow.state.desired ?? {}
						twin.metadata = shadow.metadata ?? {}
						twin.version = shadow.version ?? -1
					}
				}

				return {
					asset: {
						id: thingName as string,
						name: (attributes?.name ?? thingName) as string,
						version: thingVersion ?? -1,
					},
					twin,
				}
			},
		),
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
	attachIotPolicyToIdentity: async ({ policyName, identityId }) => {
		const { policies } = await iot.send(
			new ListAttachedPoliciesCommand({
				target: identityId,
			}),
		)
		if ((policies?.length ?? 0) > 0) {
			return
		}
		await iot.send(
			new AttachPolicyCommand({
				target: identityId,
				policyName,
			}),
		)
	},
	updateThing: async (thingName, { name }) => {
		await iot.send(
			new UpdateThingCommand({
				thingName,
				attributePayload: {
					attributes: {
						name,
					},
				},
			}),
		)
	},
	updateShadow: async (thingName, patch) => {
		await iotData.send(
			new UpdateThingShadowCommand({
				thingName,
				payload: fromUtf8(
					JSON.stringify({
						state: patch,
					}),
				),
			}),
		)
	},
})
