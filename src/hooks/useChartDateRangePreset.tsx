import { Type } from '@sinclair/typebox'
import { DateRange, useChartDateRange } from 'hooks/useChartDateRange.js'
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
import { withLocalStorage } from 'utils/withLocalStorage.js'

const storedDateRangePrefix = withLocalStorage({
	schema: Type.Integer({ minimum: 1 }),
	key: 'chart:dateRangePreset',
})

type Preset = {
	label: string
	days: number
}

export const presets: Preset[] = [
	{ label: 'Last 24 hours', days: 1 },
	{ label: 'Last 7 days', days: 7 },
	{ label: 'Last 30 days', days: 30 },
]

export const presetToRange = ({
	days,
	now,
}: Pick<Preset, 'days'> & { now?: Date }): DateRange => ({
	start: new Date((now?.getTime() ?? Date.now()) - days * 24 * 60 * 60 * 1000),
	end: now ?? new Date(),
})

export const ChartDateRangePresetContext = createContext<{
	presets: Preset[]
	activePreset?: number
	enableAutoUpdate: (preset: Preset) => void
	disableAutoUpdate: () => void
}>({
	presets,
	enableAutoUpdate: () => undefined,
	disableAutoUpdate: () => undefined,
})

export const useChartDateRangePreset = () =>
	useContext(ChartDateRangePresetContext)

export const ChartDateRangePresetProvider: FunctionComponent<{
	children: ReactNode
	useChartRangeInjected?: typeof useChartDateRange
	now?: Date
	updateInterval?: number
}> = ({ children, useChartRangeInjected, now, updateInterval }) => {
	const [activePreset, setActivePreset] = useState<number | undefined>(
		storedDateRangePrefix.get(),
	)

	const interval = useRef<NodeJS.Timeout>()

	const clear = () => {
		if (interval.current === undefined) return
		console.debug(`[useChartDateRangePreset]`, 'stopping auto-update')
		clearInterval(interval.current)
	}

	const { setRange } = (useChartRangeInjected ?? useChartDateRange)()

	const update = useCallback(
		(days: number) => {
			console.debug(
				`[useChartDateRangePreset]`,
				'auto-updating chart range:',
				days,
				'days',
			)
			setRange(presetToRange({ days, now }))
		},
		[setRange, now],
	)

	// If a preset is selected by the user, update the chart date range to the start and end date of this preset every 5 minutes
	useEffect(() => {
		if (activePreset === undefined) {
			clear()
		} else {
			console.debug(`[useChartDateRangePreset]`, 'enabling auto-update')
			interval.current = setInterval(
				() => update(activePreset),
				updateInterval ?? 5 * 60 * 1000,
			)
		}
		return () => {
			clear()
		}
	}, [activePreset, update, updateInterval])

	// Update once on start of app
	useEffect(() => {
		if (activePreset === undefined) return
		update(activePreset)
	}, [activePreset, update])

	return (
		<ChartDateRangePresetContext.Provider
			value={{
				presets,
				activePreset,
				enableAutoUpdate: (preset) => {
					storedDateRangePrefix.set(preset.days)
					setActivePreset(preset.days)
				},
				disableAutoUpdate: () => {
					storedDateRangePrefix.destroy()
					setActivePreset(undefined)
				},
			}}
		>
			{children}
		</ChartDateRangePresetContext.Provider>
	)
}
