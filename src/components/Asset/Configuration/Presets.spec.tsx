/**
 * @jest-environment jsdom
 */
import { defaultConfig, presetConfigs } from 'asset/config.js'
import { Presets } from 'components/Asset/Configuration/Presets.js'
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
		expect(title[1]).toEqual('Configuration Presets')

		const description = presets.findOne('#about')
		expect(description.content()).toEqual(
			"Below are configuration presets that provide sensible defaults for typical application scenarios. Click 'Apply' to upload these settings to the asset.",
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
		expect(title.content()).toEqual('Parcel tracking')

		const description = parcel.findOne('p')
		expect(description.content()).toEqual(
			'Use this if you want to track parcels. It records location every hour when not moving and every 20 minutes when on the move. The accelerometer is configured for motion in vehicles.',
		)

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
			'Use this to track people activities like walking. It records location every hour when not moving and every 5 minutes when on the move. The accelerometer is configured for light motion, like walking.',
		)

		const button = presets.findOne('#walking-preset-config')
		button.props.onClick()
		expect(setNewDesiredConfig).toHaveBeenCalledWith(currentDesiredConfig)
	})
})
