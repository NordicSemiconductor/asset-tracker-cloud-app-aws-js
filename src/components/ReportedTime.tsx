import {
	AlertIcon,
	ClockIcon,
	CloudUploadIcon,
	IconWithText,
} from 'components/FeatherIcon'
import { RelativeTime } from 'components/RelativeTime'
import { formatDuration } from 'date-fns'
import { useReportedTime } from 'hooks/useReportedTime'
import type { HTMLProps } from 'react'

const OldWarning = ({
	reportIsOld,
	staleAfterSeconds,
}: {
	staleAfterSeconds: number
	reportIsOld: boolean
}) => {
	if (!reportIsOld) return null
	const hours = Math.floor(staleAfterSeconds / 3600)
	const minutes = Math.floor((staleAfterSeconds - hours * 3600) / 60)
	const seconds = staleAfterSeconds - hours * 3600 - minutes * 60
	return (
		<abbr
			className="ps-1"
			title={`The asset is expected to report updates roughly every ${formatDuration(
				{ minutes, hours, seconds },
				{ delimiter: ' and ' },
			)}, but the data is older.`}
		>
			<AlertIcon />
		</abbr>
	)
}

export const ReportedTime = ({
	reportedAtSeconds,
	receivedAtSeconds,
	staleAfterSeconds,
	className,
	...restProps
}: HTMLProps<HTMLSpanElement> & Parameters<typeof useReportedTime>[0]) => {
	const { reportedTimeIsOutDated, relativeTimesHaveDiff, reportIsOld } =
		useReportedTime({
			reportedAtSeconds,
			receivedAtSeconds,
			staleAfterSeconds,
		})
	return (
		<span className={`reportedTime d-flex ${className}`} {...restProps}>
			<IconWithText>
				{staleAfterSeconds !== undefined && (
					<OldWarning
						reportIsOld={reportIsOld}
						staleAfterSeconds={staleAfterSeconds}
					/>
				)}
				<ClockIcon />
				<RelativeTime
					ts={new Date(reportedAtSeconds * 1000)}
					key={reportedAtSeconds.toString()}
				/>
			</IconWithText>
			{receivedAtSeconds !== undefined &&
				reportedTimeIsOutDated &&
				relativeTimesHaveDiff && (
					<span className="ms-2">
						<IconWithText>
							<CloudUploadIcon />
							<RelativeTime
								ts={new Date(receivedAtSeconds * 1000)}
								key={receivedAtSeconds.toString()}
							/>
						</IconWithText>
					</span>
				)}
		</span>
	)
}
