import { useRelativeTime } from 'hooks/useRelativeTime'

export const RelativeTime = ({ ts }: { ts: Date }) => {
	const label = useRelativeTime({ ts })
	return <time dateTime={ts.toISOString()}>{label}</time>
}
