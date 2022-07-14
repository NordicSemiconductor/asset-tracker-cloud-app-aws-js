import { Type } from '@sinclair/typebox'
import { DateRange, useChartDateRange } from 'hooks/useChartDateRange'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useCallback,
	useContext,
	useEffect,
	useRef,
	useState,
} from 'react'
import { withLocalStorage } from 'utils/withLocalStorage'

const storedDateRangePrefix = withLocalStorage({
	schema: Type.Integer({ minimum: 1 }),
	key: 'chart:dateRangePreset',
})

type Preset = {
	label: string
	days: number
}

const presets: Preset[] = [
	{ label: 'Last 24 hours', days: 1 },
	{ label: 'Last 7 days', days: 7 },
	{ label: 'Last 30 days', days: 30 },
]

export const presetToRange = ({ days }: Pick<Preset, 'days'>): DateRange => ({
	start: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
	end: new Date(),
})

export const ChartDateRangePresetContext = createContext<{
	presets: Preset[]
	enableAutoUpdate: (preset: Preset) => void
	disableAutoUpdate: () => void
}>({
	presets,
	enableAutoUpdate: () => undefined,
	disableAutoUpdate: () => undefined,
})

export const useChartDateRangePrefix = () =>
	useContext(ChartDateRangePresetContext)

export const CurrentChartDateRangeProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [storedPrefix, setStoredPrefix] = useState<number | undefined>(
		storedDateRangePrefix.get(),
	)

	const updateInterval = useRef<NodeJS.Timeout>()

	const clear = () => {
		if (updateInterval.current === undefined) return
		console.debug(`[useChartDateRangePreset]`, 'stopping auto-update')
		clearInterval(updateInterval.current)
	}

	const { setRange } = useChartDateRange()

	const update = useCallback(
		(days: number) => {
			console.debug(
				`[useChartDateRangePreset]`,
				'auto-updating chart range',
				days,
				'days',
			)
			setRange(presetToRange({ days }))
		},
		[setRange],
	)

	// If a preset is selected by the user, update the chart date range to the start and end date of this preset every 5 minutes
	useEffect(() => {
		if (storedPrefix === undefined) {
			clear()
		} else {
			console.debug(`[useChartDateRangePreset]`, 'enabling auto-update')
			updateInterval.current = setInterval(
				() => update(storedPrefix),
				5 * 60 * 1000,
			)
		}
		return () => {
			clear()
		}
	}, [storedPrefix, update])

	// Update once on start of app
	useEffect(() => {
		if (storedPrefix === undefined) return
		update(storedPrefix)
	}, [storedPrefix, update])

	return (
		<ChartDateRangePresetContext.Provider
			value={{
				presets,
				enableAutoUpdate: (preset) => {
					storedDateRangePrefix.set(preset.days)
					setStoredPrefix(preset.days)
				},
				disableAutoUpdate: () => {
					storedDateRangePrefix.destroy()
					setStoredPrefix(undefined)
				},
			}}
		>
			{children}
		</ChartDateRangePresetContext.Provider>
	)
}
