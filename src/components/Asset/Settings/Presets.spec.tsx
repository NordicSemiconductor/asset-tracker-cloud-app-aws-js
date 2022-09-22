/**
 * @jest-environment jsdom
 */
import { defaultConfig, presetConfigs } from 'asset/config.js'
import { Presets } from 'components/Asset/Settings/Presets.js'
import { isolateComponent } from 'isolate-react'

describe('Presets()', () => {
	it('should display an explanation in text related to the preset asset configuration', () => {
		const setNewDesiredConfig = jest.fn()
		const currentDesiredConfig = defaultConfig

		const presets = isolateComponent(
			<Presets
				setDesiredConfig={setNewDesiredConfig}
				currentDesiredConfig={currentDesiredConfig}
			/>,
		)
		const collapsable = presets.findOne('Collapsable')
		const title = collapsable.props.title.props.children
		expect(title[1]).toEqual('Preset asset configuration')

		const description = presets.findOne('#about')
		expect(description.content()).toEqual(
			'Recommended setting values for common use cases',
		)
	})

	it('should check Parcel Config to be submited', () => {
		const setNewDesiredConfig = jest.fn()
		const currentDesiredConfig = presetConfigs.parcel.config

		const presets = isolateComponent(
			<Presets
				setDesiredConfig={setNewDesiredConfig}
				currentDesiredConfig={currentDesiredConfig}
			/>,
		)

		const parcel = presets.findOne('#parcel-info')

		const title = parcel.findOne('h5')
		expect(title.content()).toEqual('Parcel')

		const description = parcel.findOne('p')
		expect(description.content()).toEqual('Used for tracking parcels.')

		const button = presets.findOne('#parcel-preset-config')
		button.props.onClick()
		expect(setNewDesiredConfig).toHaveBeenCalledWith(currentDesiredConfig)
	})

	it('should check Walking Config to be submited', () => {
		const setNewDesiredConfig = jest.fn()
		const currentDesiredConfig = presetConfigs.walking.config

		const presets = isolateComponent(
			<Presets
				setDesiredConfig={setNewDesiredConfig}
				currentDesiredConfig={currentDesiredConfig}
			/>,
		)

		const parcel = presets.findOne('#walking-info')

		const title = parcel.findOne('h5')
		expect(title.content()).toEqual('Walking')

		const description = parcel.findOne('p')
		expect(description.content()).toEqual(
			'Ideal to track walking activities as hiking for example.',
		)

		const button = presets.findOne('#walking-preset-config')
		button.props.onClick()
		expect(setNewDesiredConfig).toHaveBeenCalledWith(currentDesiredConfig)
	})
})
