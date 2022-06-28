import * as am5 from '@amcharts/amcharts5'
import * as am5xy from '@amcharts/amcharts5/xy'
import { useChartDateRange } from 'hooks/useChartDateRange'
import { nanoid } from 'nanoid'
import { useLayoutEffect, useRef } from 'react'

export const AMChart = ({
	data,
	type,
	min,
	max,
	className,
}: {
	data: { value: number; date: Date }[]
	type: 'line' | 'column'
	min?: number
	max?: number
	className?: string
}) => {
	const id = useRef<string>(nanoid())
	const {
		range: { start: startDate, end: endDate },
	} = useChartDateRange()

	useLayoutEffect(() => {
		const root = am5.Root.new(id.current)
		const chart = root.container.children.push(am5xy.XYChart.new(root, {}))

		const dateAxis = chart.xAxes.push(
			am5xy.DateAxis.new(root, {
				baseInterval: { timeUnit: 'second', count: 1 },
				renderer: am5xy.AxisRendererX.new(root, {}),
				min: startDate.getTime(),
				max: endDate.getTime(),
			}),
		)

		const valueAxes = chart.yAxes.push(
			am5xy.ValueAxis.new(root, {
				min,
				max,
				renderer: am5xy.AxisRendererY.new(root, {}),
			}),
		)

		const tooltip = am5.Tooltip.new(root, {
			labelText: '{valueY}',
		})

		const series = chart.series.push(
			type === 'column'
				? am5xy.ColumnSeries.new(root, {
						xAxis: dateAxis,
						yAxis: valueAxes,
						valueYField: 'value',
						valueXField: 'date',
						tooltip,
				  })
				: am5xy.LineSeries.new(root, {
						xAxis: dateAxis,
						yAxis: valueAxes,
						valueYField: 'value',
						valueXField: 'date',
						tooltip,
				  }),
		)

		series.data.setAll(
			data.map(({ date, value }) => ({ value, date: date.getTime() })),
		)

		chart.set(
			'cursor',
			am5xy.XYCursor.new(root, {
				snapToSeries: [series],
				xAxis: dateAxis,
			}),
		)

		return () => {
			root.dispose()
		}
	}, [data, type, min, max, id, startDate, endDate])

	return (
		<div
			style={{ width: '100%', height: '400px' }}
			id={id.current}
			className={`historical-data-chart ${className ?? ''}`}
		/>
	)
}
