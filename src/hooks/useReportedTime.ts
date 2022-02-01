import type { UnixTimeInSeconds } from 'asset/asset'
import { formatDistanceToNow } from 'date-fns'

export const useReportedTime = ({
	reportedAtSeconds,
	receivedAtSeconds,
	staleAfterSeconds,
}: {
	reportedAtSeconds: UnixTimeInSeconds
	receivedAtSeconds?: UnixTimeInSeconds
	staleAfterSeconds?: number
}): {
	reportedTimeIsOutDated: boolean
	relativeTimesHaveDiff: boolean
	reportIsOld: boolean
} => {
	const reportedTimeIsOutDated =
		receivedAtSeconds === undefined
			? false
			: receivedAtSeconds - reportedAtSeconds > 300
	const relativeTimesHaveDiff =
		receivedAtSeconds === undefined
			? false
			: formatDistanceToNow(new Date(receivedAtSeconds * 1000), {
					includeSeconds: true,
					addSuffix: true,
			  }) !==
			  formatDistanceToNow(new Date(reportedAtSeconds * 1000), {
					includeSeconds: true,
					addSuffix: true,
			  })
	const reportIsOld =
		(Date.now() - reportedAtSeconds * 1000) / 1000 >
		(staleAfterSeconds ?? Number.MAX_SAFE_INTEGER)

	return {
		reportedTimeIsOutDated,
		relativeTimesHaveDiff,
		reportIsOld,
	}
}
