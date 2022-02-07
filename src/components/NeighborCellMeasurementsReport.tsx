import type {
	Asset,
	AssetTwin,
	NCellMeasReport,
	UnixTimeInMilliseconds,
	UnixTimeInSeconds,
} from 'asset/asset'
import { expectedSendIntervalInSeconds } from 'asset/expectedSendIntervalInSeconds'
import styles from 'components/Asset/AssetInformation.module.css'
import { ChartDateRange } from 'components/ChartDateRange'
import { Loading } from 'components/Loading'
import { NoData } from 'components/NoData'
import { ReportedTime } from 'components/ReportedTime'
import { useState } from 'react'

/**
 * FIXME: implement
 */
export const NeighborCellMeasurementsReport = ({
	asset,
	twin,
}: {
	asset: Asset
	twin?: AssetTwin
}) => {
	const expectedInterval = expectedSendIntervalInSeconds(twin)

	const [loading] = useState<boolean>(true)

	const [nCellMeasReport] = useState<{
		v: NCellMeasReport
		ts: UnixTimeInMilliseconds
		receivedAt: UnixTimeInSeconds
	}>()

	if (loading)
		return (
			<>
				<ChartDateRange />
				<Loading />
			</>
		)

	if (nCellMeasReport === undefined)
		return (
			<>
				<ChartDateRange />
				<NoData />
			</>
		)

	const report = nCellMeasReport.v

	return (
		<div className={styles.assetInformation}>
			{(report.nmr?.length ?? 0) === 0 && (
				<NoData>No neighboring cells found.</NoData>
			)}
			{(report.nmr?.length ?? 0) > 0 && (
				<ol>
					{report.nmr?.map((cell, k) => (
						<li key={k}>
							<dl className={styles.AssetInformation}>
								<dt>RSRP</dt>
								<dd>
									<code>{cell.rsrp}</code>
								</dd>
								<dt>RSRQ</dt>
								<dd>
									<code>{cell.rsrq}</code>
								</dd>
								<dt>CellID</dt>
								<dd>
									<code>{cell.cell}</code>
								</dd>
								<dt>EARFCN</dt>
								<dd>
									<code>{cell.earfcn}</code>
								</dd>
							</dl>
						</li>
					))}
				</ol>
			)}
			<ReportedTime
				receivedAtSeconds={nCellMeasReport.receivedAt}
				reportedAtSeconds={nCellMeasReport.ts / 1000}
				staleAfterSeconds={expectedInterval}
			/>
		</div>
	)
}
