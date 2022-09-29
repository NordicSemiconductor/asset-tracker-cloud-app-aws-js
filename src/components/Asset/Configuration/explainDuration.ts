import { formatDuration, intervalToDuration } from 'date-fns'

export const explainDuration = (value: number): string => {
	if (isNaN(value)) return '... click here to fill input'
	return `${formatDuration(
		intervalToDuration({ start: 0, end: value * 1000 }),
	)} (${value} seconds)`
}
