import { DeleteJobExecutionCommand, IoTClient } from '@aws-sdk/client-iot'
import { DeleteObjectCommand, S3Client } from '@aws-sdk/client-s3'
import type { DeviceUpgradeFirmwareJob } from 'api/iot/createFirmwareJob'

export const deleteUpgradeFirmwareJob =
	({
		iot,
		s3,
		fotaBucketName,
	}: {
		iot: IoTClient
		s3: S3Client
		fotaBucketName: string
	}) =>
	async ({
		jobId,
		thingArn,
		executionNumber,
	}: DeviceUpgradeFirmwareJob): Promise<void> => {
		await s3
			.send(
				new DeleteObjectCommand({
					Bucket: fotaBucketName,
					Key: jobId,
				}),
			)
			.catch((error) => {
				console.error(`Failed to delete firmware file for job ${jobId}`)
				console.error(error)
			})
		await iot
			.send(
				new DeleteJobExecutionCommand({
					jobId,
					thingName: thingArn.split('/')[1],
					executionNumber,
				}),
			)
			.catch((error) => {
				console.error(`Failed to delete job ${jobId}`)
				console.error(error)
			})
	}
