import {
	DynamoDBClient,
	GetItemCommand,
	QueryCommand,
	type QueryCommandInput,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import {
	NetworkSurvey,
	type NetworkSurveyData,
} from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'
import { type Asset } from 'asset/asset.js'
import { validPassthrough } from 'utils/validPassthrough.js'

const validPassthroughNetworkSurvey = validPassthrough(NetworkSurvey)

export type ParsedNetworkSurvey = {
	surveyId: string
	deviceId: string
	nw?: string
	timestamp: string
	unresolved?: boolean
	position?: { lat: number; lng: number; accuracy: number }
} & NetworkSurveyData

export const fetchNetworkSurveys =
	({
		networkSurveyTableName,
		dynamoDB,
	}: {
		networkSurveyTableName: string
		dynamoDB: DynamoDBClient
	}) =>
	async ({
		asset,
		Limit,
		range,
	}: {
		asset: Asset
		Limit: number
		range?: {
			start: Date
			end: Date
		}
	}): Promise<ParsedNetworkSurvey[]> => {
		const query: QueryCommandInput = {
			TableName: networkSurveyTableName,
			IndexName: 'surveyByDevice',
			KeyConditionExpression: '#deviceId = :deviceId',
			ExpressionAttributeNames: {
				'#deviceId': 'deviceId',
			},
			ExpressionAttributeValues: {
				':deviceId': {
					S: asset.id,
				},
			},
			ScanIndexForward: false,
			Limit,
		}
		if (range !== undefined) {
			const { start, end } = range
			query.KeyConditionExpression = `${query.KeyConditionExpression} AND #timestamp BETWEEN :start and :end`
			query.ExpressionAttributeNames = {
				...query.ExpressionAttributeNames,
				'#timestamp': 'timestamp',
			}

			query.ExpressionAttributeValues = {
				...query.ExpressionAttributeValues,
				':start': { S: start.toISOString() },
				':end': { S: end.toISOString() },
			}
		}
		const { Items } = await dynamoDB.send(new QueryCommand(query))

		if (Items === undefined || Items.length === 0) return []

		const fullSurveys = await Promise.all(
			Items.map(async ({ surveyId }) =>
				dynamoDB.send(
					new GetItemCommand({
						TableName: networkSurveyTableName,
						Key: {
							surveyId,
						},
					}),
				),
			),
		)

		const validSurveys = fullSurveys
			.map(({ Item }) =>
				validPassthroughNetworkSurvey(
					unmarshall(Item ?? {}) as ParsedNetworkSurvey,
				),
			)
			.filter((survey) => survey !== undefined) as ParsedNetworkSurvey[]

		return validSurveys
	}
