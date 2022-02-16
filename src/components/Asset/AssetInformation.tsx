import type { AssetTwin } from 'asset/asset'
import { expectedSendIntervalInSeconds } from 'asset/expectedSendIntervalInSeconds'
import styles from 'components/Asset/AssetInformation.module.css'
import { NoData } from 'components/NoData'
import { ReportedTime } from 'components/ReportedTime'

export const AssetInformation = ({ twin }: { twin?: AssetTwin }) => {
	const expectedInterval = expectedSendIntervalInSeconds(twin)
	const { dev, roam } = twin?.reported ?? {}
	if (dev === undefined) return <NoData />

	return (
		<div className={styles.assetInformation} id="asset-information">
			<h4>Hard- and Software</h4>
			<dl>
				<dt>Board</dt>
				<dd>
					<code data-test="dev-brdV">{dev.v.brdV}</code>
				</dd>
				<dt>Modem</dt>
				<dd>
					<code data-test="dev-modV">{dev.v.modV}</code>
				</dd>
				<dt>Application</dt>
				<dd>
					<code data-test="dev-appV">{dev.v.appV}</code>
				</dd>
				<dt>IMEI</dt>
				<dd>
					<code data-test="dev-imei">{dev.v.imei}</code>
				</dd>
				<dt>ICCID</dt>
				<dd>
					<code data-test="dev-iccid">{dev.v.iccid}</code>
				</dd>
			</dl>
			<h4>Connection</h4>
			{roam === undefined && <NoData />}
			{roam && (
				<dl>
					<dt>Network</dt>
					<dd>
						<code data-test="roam-nw">{roam.v.nw}</code>
					</dd>
					<dt>Band</dt>
					<dd>
						<code data-test="roam-band">{roam.v.band}</code>
					</dd>
					<dt>RSRP</dt>
					<dd>
						<code data-test="roam-rsrp">{roam.v.rsrp}</code>
					</dd>
					<dt>MCC/MNC</dt>
					<dd>
						<code data-test="roam-mccmnc">{roam.v.mccmnc}</code>
					</dd>
					<dt>Area Code</dt>
					<dd>
						<code data-test="roam-area">{roam.v.area}</code>
					</dd>
					<dt>CellID</dt>
					<dd>
						<code data-test="roam-cell">{roam.v.cell}</code>
					</dd>
					<dt>IP</dt>
					<dd>
						<code data-test="roam-ip">{roam.v.ip}</code>
					</dd>
				</dl>
			)}
			<ReportedTime
				data-intro="This shows when the device sampled the information and when it was received by the cloud."
				reportedAtSeconds={(roam?.ts ?? dev.ts) / 1000}
				receivedAtSeconds={twin?.metadata?.reported?.dev?.ts?.timestamp}
				staleAfterSeconds={expectedInterval}
			/>
		</div>
	)
}
