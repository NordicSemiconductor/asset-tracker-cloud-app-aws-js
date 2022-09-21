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

		const title = presets.findOne('h5')
		expect(title.content()).toEqual('Preset asset configuration')

		const description = presets.findOne('#description')
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

		const collapsable = presets.findOne('#parcel')

		const title = collapsable.props.title.props.children
		expect(title).toEqual('Parcel Config')

		const description = collapsable.findOne('p')
		expect(description.content()).toEqual('Used for tracking parcels.')

		const button = collapsable.findOne('button')
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

		const collapsable = presets.findOne('#walking')

		const title = collapsable.props.title.props.children
		expect(title).toEqual('Walking Config')

		const description = collapsable.findOne('p')
		expect(description.content()).toEqual('When you want to track your hiking.')

		const button = collapsable.findOne('button')
		button.props.onClick()
		expect(setNewDesiredConfig).toHaveBeenCalledWith(currentDesiredConfig)
	})
})
