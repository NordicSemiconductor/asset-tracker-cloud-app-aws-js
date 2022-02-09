import type { AssetTwin } from 'asset/asset'
import { expectedSendIntervalInSeconds } from 'asset/expectedSendIntervalInSeconds'
import styles from 'components/Asset/AssetInformation.module.css'
import { NoData } from 'components/NoData'
import { ReportedTime } from 'components/ReportedTime'
import { useNeighboringCellMeasurementReport } from 'hooks/useNeighboringCellMeasurementReport'

export const NeighborCellMeasurementsReport = ({
	twin,
}: {
	twin?: AssetTwin
}) => {
	const expectedInterval = expectedSendIntervalInSeconds(twin)
	const { report } = useNeighboringCellMeasurementReport()

	if (report === undefined) return <NoData />

	return (
		<div className={styles.assetInformation} id="neighboring-cells">
			{(report.nmr?.length ?? 0) === 0 && (
				<NoData>No neighboring cells found.</NoData>
			)}
			{(report.nmr?.length ?? 0) > 0 && (
				<ol>
					{report.nmr?.map((cell, k) => (
						<li key={k}>
							<dl className={styles.AssetInformation}>
								<dt>RSRP</dt>
								<dd data-test="rsrp">
									<code>{cell.rsrp}</code>
								</dd>
								<dt>RSRQ</dt>
								<dd data-test="rsrq">
									<code>{cell.rsrq}</code>
								</dd>
								<dt>CellID</dt>
								<dd data-test="cell">
									<code>{cell.cell}</code>
								</dd>
								<dt>EARFCN</dt>
								<dd data-test="earfcn">
									<code>{cell.earfcn}</code>
								</dd>
							</dl>
						</li>
					))}
				</ol>
			)}
			<ReportedTime
				receivedAtSeconds={report.receivedAt.getTime() / 1000}
				reportedAtSeconds={report.reportedAt.getTime() / 1000}
				staleAfterSeconds={expectedInterval}
			/>
		</div>
	)
}
