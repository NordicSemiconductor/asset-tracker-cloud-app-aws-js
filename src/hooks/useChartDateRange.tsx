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

export const CurrentChartDateRangeContext = createContext<{
	startDate: Date
	endDate: Date
	setStartDate: (_: Date) => void
	setEndDate: (_: Date) => void
	defaultStart: Date
	defaultEnd: Date
}>({
	startDate: storedStartDate.get(),
	endDate: storedEndDate.get(),
	setStartDate: () => undefined,
	setEndDate: () => undefined,
	defaultStart,
	defaultEnd,
})

export const useChartDateRange = () => useContext(CurrentChartDateRangeContext)

export const CurrentChartDateRangeProvider: FunctionComponent = ({
	children,
}) => {
	const [startDate, setStartDate] = useState<Date>(storedStartDate.get())
	const [endDate, setEndDate] = useState<Date>(storedEndDate.get())
	return (
		<CurrentChartDateRangeContext.Provider
			value={{
				startDate,
				endDate,
				setStartDate: (startDate) => {
					if (startDate.getTime() > endDate.getTime()) return
					console.log({ startDate })
					setStartDate(startDate)
					storedStartDate.set(startDate)
				},
				setEndDate: (endDate) => {
					console.log({ endDate })
					if (endDate.getTime() < startDate.getTime()) return
					setEndDate(endDate)
					storedEndDate.set(endDate)
				},
				defaultStart,
				defaultEnd,
			}}
		>
			{children}
		</CurrentChartDateRangeContext.Provider>
	)
}
