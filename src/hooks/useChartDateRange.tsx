import { sub } from 'date-fns'
import { createContext, FunctionComponent, useContext, useState } from 'react'
import { dateFreezer, withLocalStorage } from 'utils/withLocalStorage'

const defaultStart = sub(new Date(), { months: 1 })

const storedStartDate = withLocalStorage<Date>({
	key: 'chart:startDate',
	defaultValue: defaultStart,
	freezer: dateFreezer,
})

const defaultEnd = new Date()
const storedEndDate = withLocalStorage<Date>({
	key: 'chart:endDate',
	defaultValue: defaultEnd,
	freezer: dateFreezer,
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
	startDate: Date
	endDate: Date
	binInterval: string
	setStartDate: (_: Date) => void
	setEndDate: (_: Date) => void
	setBinInterval: (_: string) => void
	defaultStart: Date
	defaultEnd: Date
	defaultBinInterval: string
	binIntervalUnits: typeof binIntervalUnits
	binIntervalUnit: keyof typeof binIntervalUnits
	binIntervalValue: number
}>({
	startDate: storedStartDate.get(),
	endDate: storedEndDate.get(),
	binInterval: storedBinInterval.get(),
	setStartDate: () => undefined,
	setEndDate: () => undefined,
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
	const [startDate, setStartDate] = useState<Date>(storedStartDate.get())
	const [endDate, setEndDate] = useState<Date>(storedEndDate.get())
	const [binInterval, setBinInterval] = useState<string>(
		storedBinInterval.get(),
	)

	return (
		<CurrentChartDateRangeContext.Provider
			value={{
				startDate,
				endDate,
				binInterval,
				setStartDate: (startDate) => {
					if (startDate.getTime() > endDate.getTime()) return
					setStartDate(startDate)
					storedStartDate.set(startDate)
				},
				setEndDate: (endDate) => {
					if (endDate.getTime() < startDate.getTime()) return
					setEndDate(endDate)
					storedEndDate.set(endDate)
				},
				setBinInterval: (binInterval) => {
					// See https://docs.aws.amazon.com/timestream/latest/developerguide/supported-data-types.html
					if (!binIntevalPattern.test(binInterval)) {
						console.error(
							`binInterval ${binInterval} is not valid. Must follow pattern ${binIntevalPattern.toString()}`,
						)
						return
					}
					console.log(binInterval)
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
