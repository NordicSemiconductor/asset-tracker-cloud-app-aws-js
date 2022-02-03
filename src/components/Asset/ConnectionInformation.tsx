import type { UnixTimeInSeconds } from 'asset/asset'
import { SignalQuality } from 'components/Asset/SignalQuality'
import {
	CellularIcon,
	IconWithText,
	SmartphoneIcon,
} from 'components/FeatherIcon'
import { ReportedTime } from 'components/ReportedTime'
import { TextWithIcon } from 'components/TextWithIcon'
import { identifyIssuer } from 'e118-iin-list'
import { filter as filterOperator, Operator as Op } from 'mcc-mnc-list'

export const Operator = ({ op }: { op?: Op }) => (
	<span className={'operator'}>{op?.brand ?? 'Unknown'}</span>
)

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
			<span>
				<TextWithIcon icon={SignalQuality({ dbm: rsrp })}>
					<>
						&nbsp;
						<Operator op={filterOperator({ mccmnc: `${mccmnc}` })[0]} />
					</>
				</TextWithIcon>
				<abbr title={'Network mode'}>
					<IconWithText>
						<CellularIcon size={16} />
						{networkMode ?? '?'}
					</IconWithText>
				</abbr>
				<abbr title={'SIM issuer'}>
					<IconWithText>
						<SmartphoneIcon size={16} />
						{maybeSimIssuer !== undefined ? maybeSimIssuer.companyName : '?'}
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
