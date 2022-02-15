import {
	CreateJobCommand,
	DescribeThingCommand,
	IoTClient,
	JobExecutionStatus,
} from '@aws-sdk/client-iot'
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3'
import { ulid } from 'utils/ulid'

export const createFirmwareJob =
	({
		iot,
		s3,
		fotaBucketName,
	}: {
		iot: IoTClient
		s3: S3Client
		fotaBucketName: string
	}) =>
	async (
		thingName: string,
		{ file, version }: { file: File; version: string },
	): Promise<DeviceUpgradeFirmwareJob> => {
		const { thingArn } = await iot.send(new DescribeThingCommand({ thingName }))
		if (thingArn === undefined)
			throw new Error(`Thing ${thingName} does not exist.`)

		const jobId = ulid()
		const data = await new Promise<Buffer>((resolve) => {
			const reader = new FileReader()
			reader.onload = (e: any) => resolve(e.target.result)
			reader.readAsArrayBuffer(file)
		})
		await s3.send(
			new PutObjectCommand({
				Bucket: fotaBucketName,
				Key: jobId,
				Body: data,
				ContentLength: file.size,
				ContentType: 'text/octet-stream',
				ContentDisposition: `attachment; filename=${file.name}`,
			}),
		)

		const description = `Upgrade ${
			thingArn.split('/')[1]
		} to version ${version}.`
		await iot.send(
			new CreateJobCommand({
				jobId,
				targets: [thingArn],
				document: JSON.stringify({
					operation: 'app_fw_update',
					size: file.size,
					filename: file.name,
					location: {
						protocol: 'https',
						host: `${fotaBucketName}.s3.amazonaws.com`,
						path: `${jobId}`,
					},
					fwversion: version,
				} as FOTAJobDocument),
				description,
				targetSelection: 'SNAPSHOT',
			}),
		)

		return {
			jobId,
			description,
			status: JobExecutionStatus.QUEUED,
			document: {
				size: file.size,
				fwversion: version,
				filename: file.name,
				location: `https://${fotaBucketName}.s3.amazonaws.com/${jobId}`,
			},
			queuedAt: new Date(),
			executionNumber: 0,
			thingArn,
		}
	}

export type DeviceUpgradeFirmwareJob = {
	jobId: string
	thingArn: string
	description: string
	status: JobExecutionStatus
	executionNumber: number
	document: {
		size: number
		fwversion: string
		location: string
		filename: string
	}
	queuedAt?: Date
	startedAt?: Date
	lastUpdatedAt?: Date
}

export type FOTAJobDocument = {
	operation: 'app_fw_update'
	size: number
	filename: string
	location: {
		protocol: 'https'
		host: string
		path: string
	}
	fwversion: string
}
