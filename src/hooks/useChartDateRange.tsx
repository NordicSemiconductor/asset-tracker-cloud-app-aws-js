import { sub } from 'date-fns'
import { createContext, FunctionComponent, useContext, useState } from 'react'
import { dateFreezer, withLocalStorage } from 'utils/withLocalStorage'

const defaultStart = sub(new Date(), { months: 1 })
const defaultEnd = new Date()

type DateRange = {
	start: Date
	end: Date
}

const storedDateRange = withLocalStorage<DateRange>({
	key: 'chart:dateRange',
	defaultValue: {
		start: defaultStart,
		end: new Date(),
	},
	freezer: {
		freeze: (v) =>
			JSON.stringify({
				start: dateFreezer.freeze(v.start),
				end: dateFreezer.freeze(v.end),
			}),
		unfreeze: (v) => {
			const { start, end } = JSON.parse(v)
			return {
				start: dateFreezer.unfreeze(start),
				end: dateFreezer.unfreeze(end),
			}
		},
	},
})

const defaultBinInterval = '1hour'
const storedBinInterval = withLocalStorage<string>({
	key: 'chart:binInterval',
	defaultValue: defaultBinInterval,
})

export enum BinIntervalUnit {
	seconds = 's',
	minutes = 'm',
	hours = 'h',
	days = 'd',
}

export const binIntervalUnits: Record<BinIntervalUnit, string> = {
	[BinIntervalUnit.seconds]: 'seconds',
	[BinIntervalUnit.minutes]: 'minutes',
	[BinIntervalUnit.hours]: 'hours',
	[BinIntervalUnit.days]: 'days',
}

const binIntevalPattern = new RegExp(
	`^(?<interval>[0-9]+)(?<unit>${Object.keys(binIntervalUnits).join('|')})$`,
)

export const CurrentChartDateRangeContext = createContext<{
	range: DateRange
	binInterval: string
	setRange: (range: DateRange) => void
	setBinInterval: (_: string) => void
	defaultStart: Date
	defaultEnd: Date
	defaultBinInterval: string
	binIntervalUnits: typeof binIntervalUnits
	binIntervalUnit: keyof typeof binIntervalUnits
	binIntervalValue: number
}>({
	range: storedDateRange.get(),
	binInterval: storedBinInterval.get(),
	setRange: () => undefined,
	setBinInterval: () => undefined,
	defaultStart,
	defaultEnd,
	defaultBinInterval,
	binIntervalUnits,
	binIntervalUnit: (binIntevalPattern.exec(defaultBinInterval)?.groups?.unit ??
		BinIntervalUnit.hours) as BinIntervalUnit,
	binIntervalValue: parseInt(
		binIntevalPattern.exec(defaultBinInterval)?.groups?.interval ?? '1',
		10,
	),
})

export const useChartDateRange = () => useContext(CurrentChartDateRangeContext)

export const CurrentChartDateRangeProvider: FunctionComponent = ({
	children,
}) => {
	const [range, setDateRange] = useState<DateRange>(storedDateRange.get())
	const [binInterval, setBinInterval] = useState<string>(
		storedBinInterval.get(),
	)

	return (
		<CurrentChartDateRangeContext.Provider
			value={{
				range,
				binInterval,
				setRange: (range) => {
					const { start: startDate, end: endDate } = range
					if (startDate.getTime() > endDate.getTime()) return
					if (endDate.getTime() < startDate.getTime()) return
					setDateRange(range)
					storedDateRange.set(range)
				},
				setBinInterval: (binInterval) => {
					// See https://docs.aws.amazon.com/timestream/latest/developerguide/supported-data-types.html
					if (!binIntevalPattern.test(binInterval)) {
						console.error(
							`binInterval ${binInterval} is not valid. Must follow pattern ${binIntevalPattern.toString()}`,
						)
						return
					}
					setBinInterval(binInterval)
					storedBinInterval.set(binInterval)
				},
				defaultStart,
				defaultEnd,
				defaultBinInterval,
				binIntervalUnits,
				binIntervalUnit: (binIntevalPattern.exec(binInterval)?.groups?.unit ??
					BinIntervalUnit.hours) as BinIntervalUnit,
				binIntervalValue: parseInt(
					binIntevalPattern.exec(binInterval)?.groups?.interval ?? '1',
					10,
				),
			}}
		>
			{children}
		</CurrentChartDateRangeContext.Provider>
	)
}
