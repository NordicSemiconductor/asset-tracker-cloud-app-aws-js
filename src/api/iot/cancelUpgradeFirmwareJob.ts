import { CancelJobExecutionCommand, IoTClient } from '@aws-sdk/client-iot'
import type { DeviceUpgradeFirmwareJob } from 'api/iot/createFirmwareJob.js'

export const cancelUpgradeFirmwareJob =
	({ iot }: { iot: IoTClient }) =>
	async (
		{ jobId, thingArn }: DeviceUpgradeFirmwareJob,
		force = false,
	): Promise<void> => {
		await iot.send(
			new CancelJobExecutionCommand({
				jobId,
				force,
				thingName: thingArn.split('/')[1],
			}),
		)
	}
