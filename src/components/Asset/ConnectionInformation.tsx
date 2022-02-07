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
			<span className="connection-info">
				<IconWithText>
					<RSRP
						dbm={rsrp}
						renderBar={({ quality, dbm }) => (
							<>
								<SignalQualityTriangle
									style={{
										width: '20px',
										height: '20px',
										marginRight: '0.2rem',
									}}
									quality={quality}
								/>

								<span className="text">
									<small>{`(${dbm} dBm)`}</small>{' '}
									{filterOperator({ mccmnc: `${mccmnc}` })[0].brand ??
										'Unknown'}
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
				<abbr title={'Network mode'}>
					<IconWithText>
						<CellularIcon size={16} />
						<span className="text">{networkMode ?? '?'}</span>
					</IconWithText>
				</abbr>
				<abbr title={'SIM issuer'}>
					<IconWithText>
						<SmartphoneIcon size={16} />
						<span className="text">
							{maybeSimIssuer !== undefined ? maybeSimIssuer.companyName : '?'}
						</span>
					</IconWithText>
				</abbr>
			</span>
			<ReportedTime
				reportedAtSeconds={reportedAtSeconds}
				receivedAtSeconds={receivedAtSeconds}
				staleAfterSeconds={dataStaleAfterSeconds}
			/>
		</>
	)
}
