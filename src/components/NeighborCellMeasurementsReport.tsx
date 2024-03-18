import type { AssetTwin } from 'asset/asset.js'
import { expectedSendIntervalInSeconds } from 'asset/expectedSendIntervalInSeconds.js'
import styles from 'components/Asset/AssetInformation.module.css'
import { NoData } from 'components/NoData.js'
import { ReportedTime } from 'components/ReportedTime.js'
import { useNetworkSurvey } from 'hooks/useNetworkSurvey.js'

export const NeighborCellMeasurementsReport = ({
	twin,
}: {
	twin?: AssetTwin
}) => {
	const expectedInterval = expectedSendIntervalInSeconds(twin)
	const survey = useNetworkSurvey()

	if (survey?.lte === undefined) return <NoData />

	return (
		<div className={styles.assetInformation} id="neighboring-cells">
			{(survey.lte.nmr?.length ?? 0) === 0 && (
				<NoData>No neighboring cells found.</NoData>
			)}
			{(survey.lte.nmr?.length ?? 0) > 0 && (
				<ol>
					{survey.lte.nmr?.map((cell, k) => (
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
				receivedAtSeconds={new Date(survey.timestamp).getTime() / 1000}
				reportedAtSeconds={survey.lte.ts / 1000}
				staleAfterSeconds={expectedInterval}
			/>
		</div>
	)
}
