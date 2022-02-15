import { RSRP, SignalQualityTriangle } from '@nordicsemiconductor/rsrp-bar'
import type { UnixTimeInSeconds } from 'asset/asset'
import {
	CellularIcon,
	IconWithText,
	SmartphoneIcon,
	XSquareIcon,
} from 'components/FeatherIcon'
import { ReportedTime } from 'components/ReportedTime'
import { identifyIssuer } from 'e118-iin-list'
import { filter as filterOperator } from 'mcc-mnc-list'

export const ConnectionInformation = ({
	networkMode,
	rsrp,
	mccmnc,
	reportedAtSeconds,
	receivedAtSeconds,
	iccid,
	dataStaleAfterSeconds,
}: {
	networkMode?: string
	iccid?: string
	rsrp: number
	mccmnc: number
	reportedAtSeconds: UnixTimeInSeconds
	receivedAtSeconds?: UnixTimeInSeconds
	dataStaleAfterSeconds: number
}) => {
	const maybeSimIssuer = iccid !== undefined ? identifyIssuer(iccid) : undefined
	return (
		<>
			<span
				className="connection-info"
				data-intro="This shows the most recent information about the asset's cellular connection."
			>
				<IconWithText>
					<RSRP
						dbm={rsrp}
						renderBar={({ quality, dbm }) => (
							<>
								<span
									data-intro="This is the most recent signal quality."
									className="pe-1"
								>
									<SignalQualityTriangle
										style={{
											width: '20px',
											height: '20px',
											marginRight: '0.2rem',
										}}
										quality={quality}
									/>
								</span>
								<span className="text">
									<small>{`(${dbm} dBm)`}</small>{' '}
									<span data-intro="This is the name of the network operator the asset is connected to.">
										{filterOperator({ mccmnc: `${mccmnc}` })[0].brand ??
											'Unknown'}
									</span>
								</span>
							</>
						)}
						renderInvalid={() => (
							<abbr title={`Unexpected value ${rsrp} reported!`}>
								<XSquareIcon />
							</abbr>
						)}
					/>
				</IconWithText>
				<abbr data-intro={'This is the network mode the asset is using.'}>
					<IconWithText>
						<CellularIcon size={16} />
						<span className="text">{networkMode ?? '?'}</span>
					</IconWithText>
				</abbr>
				<abbr
					data-intro={'This is the issue of the SIM card the asset is using.'}
				>
					<IconWithText>
						<SmartphoneIcon size={16} />
						<span className="text">
							{maybeSimIssuer !== undefined ? maybeSimIssuer.companyName : '?'}
						</span>
					</IconWithText>
				</abbr>
			</span>
			<ReportedTime
				data-intro="This shows when the device sampled the information and when it was received by the cloud."
				reportedAtSeconds={reportedAtSeconds}
				receivedAtSeconds={receivedAtSeconds}
				staleAfterSeconds={dataStaleAfterSeconds}
			/>
		</>
	)
}
