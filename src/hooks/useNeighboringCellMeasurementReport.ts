import { GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb'
import { unmarshall } from '@aws-sdk/util-dynamodb'
import { NCellMeasReport } from 'asset/asset'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import { useServices } from 'hooks/useServices'
import { useEffect, useState } from 'react'
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

export const useNeighboringCellMeasurementReport = (): {
	report?: ParsedNCellMeasReport
} => {
	const [report, setReport] = useState<ParsedNCellMeasReport>()
	const { asset } = useAsset()
	const { dynamoDB } = useServices()
	const { nCellMeasReportTableName } = useAppConfig()

	useEffect(() => {
		if (asset === undefined) return
		dynamoDB
			.send(
				new QueryCommand({
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
					Limit: 1,
				}),
			)
			.then(async ({ Items }) => {
				if (Items?.[0] === undefined) return
				const { Item } = await dynamoDB.send(
					new GetItemCommand({
						TableName: nCellMeasReportTableName,
						Key: {
							reportId: Items[0].reportId,
						},
					}),
				)
				if (Item === undefined) return
				const report = validPassthroughNeighboringCellMeasurementReport(
					unmarshall(Item) as {
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
				)

				if (report !== undefined) {
					setReport({
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
						receivedAt: new Date(parseInt(report.timestamp, 10)),
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
					})
				}
			})
			.catch((err) =>
				console.error(`[useNeighboringCellMeasurementReport]`, err),
			)
	}, [asset, dynamoDB, nCellMeasReportTableName])

	return {
		report,
	}
}
