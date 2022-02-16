import type { Static } from '@sinclair/typebox'
import type {
	AssetInfo,
	AssetWithTwin,
	Battery,
	Environment,
	GNSS,
	Roaming,
	UnixTimeInSeconds,
} from 'asset/asset'
import { expectedSendIntervalInSeconds } from 'asset/expectedSendIntervalInSeconds'
import { ConnectionInformation } from 'components/Asset/ConnectionInformation'
import styles from 'components/Asset/InfoHeader.module.css'
import {
	AltitudeIcon,
	BatteryIcon,
	CloudIcon,
	CloudRainIcon,
	IconWithText,
	SpeedIcon,
	ThermometerIcon,
} from 'components/FeatherIcon'
import { ReportedTime } from 'components/ReportedTime'
import { Toggle } from 'components/Toggle'

const RoamInfo = ({
	roam,
	dev,
	expectedSendIntervalInSeconds,
	receivedAtSeconds,
}: {
	expectedSendIntervalInSeconds: number
	roam?: Static<typeof Roaming>
	dev?: Static<typeof AssetInfo>
	receivedAtSeconds?: UnixTimeInSeconds
}) => {
	if (roam === undefined) return null
	return (
		<Toggle className={styles.assetInfoToggle}>
			<div className={styles.info} data-test="connection-info">
				<ConnectionInformation
					mccmnc={roam.v.mccmnc}
					rsrp={roam.v.rsrp}
					reportedAtSeconds={roam.ts / 1000}
					receivedAtSeconds={receivedAtSeconds}
					networkMode={roam?.v.nw}
					iccid={dev?.v.iccid}
					dataStaleAfterSeconds={expectedSendIntervalInSeconds}
				/>
			</div>
		</Toggle>
	)
}

const BatteryInfo = ({
	bat,
	expectedSendIntervalInSeconds,
	receivedAtSeconds,
}: {
	bat?: Static<typeof Battery>
	expectedSendIntervalInSeconds: number
	receivedAtSeconds?: UnixTimeInSeconds
}) => {
	if (bat === undefined) return null

	return (
		<Toggle className={styles.assetInfoToggle}>
			<div
				className={styles.info}
				data-test="battery-info"
				data-intro="The most recent voltage of the asset's battery."
			>
				<IconWithText>
					<BatteryIcon />
					{bat.v / 1000} V
				</IconWithText>
				<ReportedTime
					reportedAtSeconds={bat.ts / 1000}
					receivedAtSeconds={receivedAtSeconds}
					staleAfterSeconds={expectedSendIntervalInSeconds}
				/>
			</div>
		</Toggle>
	)
}

const GNSSInfo = ({
	gnss,
	expectedSendIntervalInSeconds,
	receivedAtSeconds,
}: {
	gnss?: Static<typeof GNSS>
	expectedSendIntervalInSeconds: number
	receivedAtSeconds?: UnixTimeInSeconds
}) => {
	if (gnss?.v?.spd === undefined && gnss?.v?.alt === undefined) return null
	return (
		<Toggle className={styles.assetInfoToggle}>
			<div className={styles.info} data-test="gnss-info">
				<span>
					{gnss.v.spd !== undefined && (
						<IconWithText data-intro="The most recent ground speed of the asset.">
							<SpeedIcon />
							{Math.round(gnss.v.spd)} m/s
						</IconWithText>
					)}
					{gnss.v.alt !== undefined && (
						<IconWithText data-intro="The most recent altitude of the asset.">
							<AltitudeIcon />
							{Math.round(gnss.v.alt)} m
						</IconWithText>
					)}
				</span>
				<ReportedTime
					reportedAtSeconds={gnss.ts / 1000}
					receivedAtSeconds={receivedAtSeconds}
					staleAfterSeconds={expectedSendIntervalInSeconds}
				/>
			</div>
		</Toggle>
	)
}

const EnvInfo = ({
	env,
	expectedSendIntervalInSeconds,
	receivedAtSeconds,
}: {
	env?: Static<typeof Environment>
	expectedSendIntervalInSeconds: number
	receivedAtSeconds?: UnixTimeInSeconds
}) => {
	if (env === undefined) return null

	return (
		<Toggle className={styles.assetInfoToggle}>
			<div className={styles.info} data-test="environment-info">
				<span>
					{env.v.temp && (
						<IconWithText data-intro="The most recent temperature measured using the environment sensor of the asset.">
							<ThermometerIcon />
							{env.v.temp}°C
						</IconWithText>
					)}
					{env.v.hum && (
						<IconWithText data-intro="The most recent humidity measured using the environment sensor of the asset.">
							<CloudRainIcon />
							{Math.round(env.v.hum)}%
						</IconWithText>
					)}
					{env.v.atmp && (
						<IconWithText data-intro="The most recent barometric pressure measured using the environment sensor of the asset.">
							<CloudIcon />
							{Math.round(env.v.atmp * 10)} hPa
						</IconWithText>
					)}
				</span>
				<ReportedTime
					reportedAtSeconds={env.ts / 1000}
					receivedAtSeconds={receivedAtSeconds}
					staleAfterSeconds={expectedSendIntervalInSeconds}
				/>
			</div>
		</Toggle>
	)
}

export const InfoHeader = ({ twin }: AssetWithTwin) => {
	const { bat, env, roam, gnss, dev } = twin.reported
	const expectedInterval = expectedSendIntervalInSeconds(twin)

	const receivedAtSeconds: Record<string, UnixTimeInSeconds | undefined> = {
		bat: twin.metadata?.reported?.bat?.ts?.timestamp,
		env: twin.metadata?.reported?.env?.ts?.timestamp,
		roam: twin.metadata?.reported?.roam?.ts?.timestamp,
		gnss: twin.metadata?.reported?.gnss?.ts?.timestamp,
		dev: twin.metadata?.reported?.dev?.ts?.timestamp,
	} as const

	return (
		<>
			<RoamInfo
				roam={roam}
				expectedSendIntervalInSeconds={expectedInterval}
				dev={dev}
				receivedAtSeconds={receivedAtSeconds.roam ?? receivedAtSeconds.dev}
			/>
			<GNSSInfo
				gnss={gnss}
				expectedSendIntervalInSeconds={expectedInterval}
				receivedAtSeconds={receivedAtSeconds.gnss}
			/>
			<BatteryInfo
				bat={bat}
				expectedSendIntervalInSeconds={expectedInterval}
				receivedAtSeconds={receivedAtSeconds.bat}
			/>
			<EnvInfo
				env={env}
				expectedSendIntervalInSeconds={expectedInterval}
				receivedAtSeconds={receivedAtSeconds.env}
			/>
		</>
	)
}
