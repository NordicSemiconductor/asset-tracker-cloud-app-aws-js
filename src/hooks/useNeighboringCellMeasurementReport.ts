import {
	fetchNeighboringCellMeasurementReports,
	ParsedNCellMeasReport,
} from 'api/fetchNeighboringCellMeasurementReports'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import { useServices } from 'hooks/useServices'
import { useEffect, useState } from 'react'

export const useNeighboringCellMeasurementReport = ():
	| ParsedNCellMeasReport
	| undefined => {
	const [report, setReport] = useState<ParsedNCellMeasReport>()
	const { asset } = useAsset()
	const { dynamoDB } = useServices()
	const { nCellMeasReportTableName } = useAppConfig()

	useEffect(() => {
		if (asset === undefined) return

		fetchNeighboringCellMeasurementReports({
			dynamoDB,
			nCellMeasReportTableName,
		})({ asset, Limit: 1 })
			.then((reports) => setReport(reports[0]))
			.catch((err) =>
				console.error(`[useNeighboringCellMeasurementReport]`, err),
			)
	}, [asset, dynamoDB, nCellMeasReportTableName])

	return report
}
