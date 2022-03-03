import {
	DynamoDBClient,
	GetItemCommand,
	QueryCommand,
	QueryCommandInput,
} from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import type { Static } from '@sinclair/typebox'
import { Asset, NCellMeasReport } from 'asset/asset'
import { validPassthrough } from 'utils/validPassthrough'

const validPassthroughNeighboringCellMeasurementReport =
	validPassthrough(NCellMeasReport)

export type ParsedNCellMeasReport = {
	reportId: string
	nw: string
	mcc: number
	mnc: number
	cell: number
	area: number
	earfcn: number
	adv: number
	rsrp: number
	rsrq: number
	nmr?: {
		earfcn: number
		cell: number
		rsrp: number
		rsrq: number
	}[]
	reportedAt: Date
	receivedAt: Date
	unresolved?: boolean
	position?: { lat: number; lng: number; accuracy: number }
}

export const fetchNeighboringCellMeasurementReports =
	({
		nCellMeasReportTableName,
		dynamoDB,
	}: {
		nCellMeasReportTableName: string
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
	}): Promise<ParsedNCellMeasReport[]> => {
		const query: QueryCommandInput = {
			TableName: nCellMeasReportTableName,
			IndexName: 'reportByDevice',
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

		const FullReports = await Promise.all(
			Items.map(async ({ reportId }) =>
				dynamoDB.send(
					new GetItemCommand({
						TableName: nCellMeasReportTableName,
						Key: {
							reportId,
						},
					}),
				),
			),
		)

		const validReports = FullReports.map(({ Item }) =>
			validPassthroughNeighboringCellMeasurementReport(
				unmarshall(Item ?? {}) as {
					reportId: string
					nw: string
					deviceId: string
					report: {
						area: number
						adv: number
						nmr: {
							rsrp: number
							cell: number
							rsrq: number
							earfcn: number
						}[]
						mnc: number
						rsrq: number
						rsrp: number
						mcc: number
						cell: number
						earfcn: number
						ts: number
					}
					timestamp: string
					unresolved?: boolean
					lat?: number
					lng?: number
					accuracy?: number
				},
			),
		).filter((report) => report !== undefined) as Static<
			typeof NCellMeasReport
		>[]

		return validReports.map((report) => ({
			reportId: report.reportId,
			nw: report.nw,
			mcc: report.report.mcc,
			mnc: report.report.mnc,
			cell: report.report.cell,
			area: report.report.area,
			earfcn: report.report.earfcn,
			adv: report.report.adv,
			rsrp: report.report.rsrp,
			rsrq: report.report.rsrq,
			nmr: report.report.nmr,
			reportedAt: new Date(report.report.ts),
			receivedAt: new Date(report.timestamp),
			unresolved: report.unresolved,
			position:
				report.unresolved !== true &&
				report.lat !== undefined &&
				report.lng !== undefined &&
				report.accuracy !== undefined
					? {
							lat: report.lat,
							lng: report.lng,
							accuracy: report.accuracy,
					  }
					: undefined,
		}))
	}
