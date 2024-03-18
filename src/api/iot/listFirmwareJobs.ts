import {
	DescribeJobCommand,
	DescribeThingCommand,
	GetJobDocumentCommand,
	IoTClient,
	JobExecutionStatus,
	ListJobExecutionsForThingCommand,
	type Job,
	type JobExecutionSummary,
} from '@aws-sdk/client-iot'
import type { DeviceUpgradeFirmwareJob } from 'api/iot/createFirmwareJob.js'
import { paginate } from 'utils/paginate.js'

export const listFirmwareJobs =
	({ iot }: { iot: IoTClient }) =>
	async (thingName: string): Promise<DeviceUpgradeFirmwareJob[]> =>
		paginate<DeviceUpgradeFirmwareJob>({
			paginator: async (startKey) => {
				const { thingArn } = await iot.send(
					new DescribeThingCommand({
						thingName,
					}),
				)

				if (thingArn === undefined)
					return {
						items: [],
					}

				const { executionSummaries, nextToken } = await iot.send(
					new ListJobExecutionsForThingCommand({
						thingName,
						nextToken: startKey,
					}),
				)

				if (executionSummaries === undefined || executionSummaries === null) {
					return {
						items: [],
						startKey: nextToken,
					}
				}
				return {
					items: await Promise.all(
						executionSummaries.map(async ({ jobId, jobExecutionSummary }) => {
							const [{ job }, { document }] = await Promise.all([
								iot.send(new DescribeJobCommand({ jobId: `${jobId}` })),
								iot.send(new GetJobDocumentCommand({ jobId: `${jobId}` })),
							])
							const {
								status,
								queuedAt,
								startedAt,
								lastUpdatedAt,
								executionNumber,
							} = jobExecutionSummary as JobExecutionSummary

							const {
								size,
								fwversion,
								filename,
								location: { protocol, host, path },
							} = JSON.parse(document as string)

							return {
								jobId: `${jobId}`,
								description: `${(job as Job).description}`,
								status: status as JobExecutionStatus,
								queuedAt,
								startedAt,
								lastUpdatedAt,
								document: {
									size,
									fwversion,
									location: `${protocol}://${host}/${path}`,
									filename,
								},
								executionNumber: executionNumber as number,
								thingArn,
							}
						}),
					),
					startKey: nextToken,
				}
			},
		})
