import equal from 'fast-deep-equal'

export const OutDatedWarning = <Reported, Desired>({
	desired,
	reported,
	isEqual,
	onNotReported,
	onOutDated,
}: {
	desired?: Desired
	reported?: Reported
	isEqual?: (desired: Desired, reported: Reported) => boolean
	onNotReported: React.ReactElement<any>
	onOutDated: (current: Reported) => React.ReactElement<any>
}) => {
	if (desired === undefined) return null // No config has been set by the user, yet
	if (reported === undefined) return <>{onNotReported}</>
	if ((isEqual ?? equal)(desired, reported)) {
		return null
	}
	return onOutDated(reported)
}
