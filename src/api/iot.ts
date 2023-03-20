import {
	AttachPolicyCommand,
	DeleteCertificateCommand,
	DeleteThingCommand,
	DescribeThingCommand,
	DetachThingPrincipalCommand,
	IoTClient,
	ListAttachedPoliciesCommand,
	ListThingPrincipalsCommand,
	ListThingsCommand,
	UpdateCertificateCommand,
	UpdateThingCommand,
	type ThingAttribute,
} from '@aws-sdk/client-iot'
import {
	IoTDataPlaneClient,
	UpdateThingShadowCommand,
} from '@aws-sdk/client-iot-data-plane'
import type { S3Client } from '@aws-sdk/client-s3'
import { fromUtf8 } from '@aws-sdk/util-utf8-browser'
import { cancelUpgradeFirmwareJob } from 'api/iot/cancelUpgradeFirmwareJob'
import {
	createFirmwareJob,
	type DeviceUpgradeFirmwareJob,
} from 'api/iot/createFirmwareJob'
import { deleteUpgradeFirmwareJob } from 'api/iot/deleteUpgradeFirmwareJob'
import { getTwin } from 'api/iot/getTwin'
import { listFirmwareJobs } from 'api/iot/listFirmwareJobs'
import type { Asset, AssetTwin, AssetWithTwin } from 'asset/asset'

const filterTestThings = (things: ThingAttribute[]): ThingAttribute[] =>
	things.filter((thing) => thing.attributes?.test === undefined)

const listThings =
	({ iot }: { iot: IoTClient }) =>
	async ({
		items,
		limit,
		startKey,
	}: {
		items?: Asset[]
		limit: number
		startKey?: string
	}): Promise<{
		things: Asset[]
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
		const newItems = [
			...(items ?? []),
			...filterTestThings(things ?? []).map((item) => ({
				id: item.thingName as string,
				name: (item.attributes?.name ?? item.thingName) as string,
				version: item.version ?? -1,
			})),
		] as Asset[]
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
	getTwin: (thingName: string) => Promise<AssetTwin | undefined>
	deleteThing: (thingName: string) => Promise<void>
	listThings: (options?: { limit?: number; startKey?: string }) => Promise<{
		things: Asset[]
		nextStartKey?: string
	}>
	attachIotPolicyToIdentity: (args: {
		policyName: string
		identityId: string
	}) => Promise<void>
	updateThing: (thingName: string, { name }: { name: string }) => Promise<void>
	updateShadow: (thingName: string, patch: Partial<AssetTwin>) => Promise<void>
	listJobs: (thingName: string) => Promise<DeviceUpgradeFirmwareJob[]>
	createUpgradeJob: (
		thingName: string,
		settings: {
			file: File
			version: string
		},
	) => Promise<DeviceUpgradeFirmwareJob>
	cancelUpgradeJob: (
		job: DeviceUpgradeFirmwareJob,
		force?: boolean,
	) => Promise<void>
	deleteUpgradeJob: (
		job: DeviceUpgradeFirmwareJob,
		force?: boolean,
	) => Promise<void>
}

export const iotService = ({
	iot,
	iotData,
	s3,
	fotaBucketName,
}: {
	iot: IoTClient
	iotData: IoTDataPlaneClient
	s3: S3Client
	fotaBucketName: string
}): IoTService => ({
	getThing: async (thingName: string) =>
		Promise.all([
			iot.send(
				new DescribeThingCommand({
					thingName,
				}),
			),
			getTwin({ iotData })(thingName),
		]).then(([{ thingName, attributes, version: thingVersion }, twin]) => ({
			asset: {
				id: thingName as string,
				name: (attributes?.name ?? thingName) as string,
				version: thingVersion ?? -1,
			},
			twin,
		})),
	getTwin: getTwin({ iotData }),
	deleteThing: async (thingName: string) => {
		const { principals } = await iot.send(
			new ListThingPrincipalsCommand({ thingName }),
		)
		for (const certificateArn of principals ?? []) {
			const certificateId = certificateArn.split('/')[1]
			await iot.send(
				new DetachThingPrincipalCommand({
					thingName,
					principal: certificateArn,
				}),
			)
			await iot.send(
				new UpdateCertificateCommand({
					certificateId,
					newStatus: 'INACTIVE',
				}),
			)
			await iot.send(
				new DeleteCertificateCommand({
					certificateId,
				}),
			)
		}
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
	listJobs: listFirmwareJobs({ iot }),
	createUpgradeJob: createFirmwareJob({ s3, iot, fotaBucketName }),
	cancelUpgradeJob: cancelUpgradeFirmwareJob({ iot }),
	deleteUpgradeJob: deleteUpgradeFirmwareJob({ iot, s3, fotaBucketName }),
})
