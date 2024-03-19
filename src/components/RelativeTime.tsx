import { useRelativeTime } from 'hooks/useRelativeTime.js'

export const RelativeTime = ({ ts }: { ts: Date }) => {
	const label = useRelativeTime({ ts })
	return <time dateTime={ts.toISOString()}>{label}</time>
}
