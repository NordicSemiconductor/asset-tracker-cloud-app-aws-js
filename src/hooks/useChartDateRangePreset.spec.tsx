/**
 * @jest-environment jsdom
 */
import {
	ChartDateRangePresetContext,
	ChartDateRangePresetProvider,
	presetToRange,
} from 'hooks/useChartDateRangePreset.js'
import { isolateComponent } from 'isolate-react'
import React from 'react'

describe('useChartDateRangePreset()', () => {
	describe('presetToRange()', () => {
		it.each([[1], [7], [30]])(
			'should convert a preset of %d days to a range',
			(days) => {
				const now = new Date()
				expect(presetToRange({ days, now })).toEqual({
					start: new Date(now.getTime() - days * 24 * 60 * 60 * 1000),
					end: now,
				})
			},
		)
	})

	it('should not update the chartDateRange if no preset was selected', () => {
		const setRange = jest.fn()
		const useChartRange = () =>
			({
				setRange,
			}) as any
		isolateComponent(
			<ChartDateRangePresetProvider useChartRangeInjected={useChartRange}>
				{null}
			</ChartDateRangePresetProvider>,
		)
		expect(setRange).not.toHaveBeenCalled()
	})

	it('should provide a list of presets', () => {
		const setRange = jest.fn()
		const useChartRange = () =>
			({
				setRange,
			}) as any
		const isolated = isolateComponent(
			<ChartDateRangePresetProvider useChartRangeInjected={useChartRange}>
				<ChartDateRangePresetContext.Consumer>
					{({ presets }) => (
						<dl>
							{presets.map((preset) => (
								<React.Fragment key={preset.days}>
									<dt>{preset.label}</dt>
									<dd>{preset.days}</dd>
								</React.Fragment>
							))}
						</dl>
					)}
				</ChartDateRangePresetContext.Consumer>
			</ChartDateRangePresetProvider>,
		)
		isolated.inline('*')
		const content = isolated.content()
		expect(content).toContain('<dt>Last 24 hours</dt><dd>1</dd>')
		expect(content).toContain('<dt>Last 7 days</dt><dd>7</dd>')
		expect(content).toContain('<dt>Last 30 days</dt><dd>30</dd>')
	})

	it('should update the chartDateRange if a preset is selected', () => {
		const setRange = jest.fn()
		const useChartRange = () =>
			({
				setRange,
			}) as any
		const now = new Date()
		const isolated = isolateComponent(
			<ChartDateRangePresetProvider
				useChartRangeInjected={useChartRange}
				now={now}
			>
				<ChartDateRangePresetContext.Consumer>
					{({ enableAutoUpdate, activePreset }) => {
						return (
							<>
								<button
									onClick={() => {
										enableAutoUpdate({ label: 'Last 24 hours', days: 1 })
									}}
								>
									enable
								</button>
								{activePreset !== undefined && (
									<p>Active preset: {activePreset}</p>
								)}
							</>
						)
					}}
				</ChartDateRangePresetContext.Consumer>
			</ChartDateRangePresetProvider>,
		)

		isolated.inline('*')

		isolated.findOne('button').props.onClick()

		expect(isolated.content()).toContain(`Active preset: 1`)
		expect(setRange).toHaveBeenCalled()

		const { start, end } = setRange.mock.lastCall[0]
		expect(end.getTime()).toEqual(now.getTime())
		expect(end.getTime() - start.getTime()).toEqual(24 * 60 * 60 * 1000)
	})

	it('should load the prefix from localStorage', () => {
		jest.spyOn(Storage.prototype, 'getItem')
		Storage.prototype.getItem = jest.fn(() => JSON.stringify(7))

		const setRange = jest.fn()
		const now = new Date()
		const useChartRange = () =>
			({
				setRange,
			}) as any
		const isolated = isolateComponent(
			<ChartDateRangePresetProvider
				useChartRangeInjected={useChartRange}
				now={now}
			>
				<ChartDateRangePresetContext.Consumer>
					{({ activePreset }) => {
						return (
							<>
								{activePreset !== undefined && (
									<p>Active preset: {activePreset}</p>
								)}
							</>
						)
					}}
				</ChartDateRangePresetContext.Consumer>
			</ChartDateRangePresetProvider>,
		)

		isolated.inline('*')

		expect(isolated.content()).toContain(`Active preset: 7`)
		expect(setRange).toHaveBeenCalled()

		const { start, end } = setRange.mock.lastCall[0]
		expect(end.getTime()).toEqual(now.getTime())
		expect(end.getTime() - start.getTime()).toEqual(7 * 24 * 60 * 60 * 1000)
	})

	it('should update the chart date range automatically', async () => {
		jest.spyOn(Storage.prototype, 'getItem')
		Storage.prototype.getItem = jest.fn(() => JSON.stringify(7))

		const setRange = jest.fn()
		const now = new Date()
		const useChartRange = () =>
			({
				setRange,
			}) as any
		const isolated = isolateComponent(
			<ChartDateRangePresetProvider
				useChartRangeInjected={useChartRange}
				now={now}
				updateInterval={750}
			>
				{null}
			</ChartDateRangePresetProvider>,
		)

		await new Promise((resolve) => setTimeout(resolve, 1000))

		isolated.cleanup()

		expect(setRange).toHaveBeenCalledTimes(2)

		const { start, end } = setRange.mock.lastCall[0]
		expect(end.getTime()).toEqual(now.getTime())
		expect(end.getTime() - start.getTime()).toEqual(7 * 24 * 60 * 60 * 1000)
	})
})
