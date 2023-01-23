/**
 * @jest-environment jsdom
 */
import { defaultConfig, presetConfigs } from 'asset/config.js'
import { Presets } from 'components/Asset/Configuration/Presets.js'
import { isolateComponent } from 'isolate-react'

test('<Presets/>', async () => {
	const setNewDesiredConfig = jest.fn()
	const currentDesiredConfig = defaultConfig
	const isolated = isolateComponent(
		<Presets
			setDesiredConfig={setNewDesiredConfig}
			currentDesiredConfig={currentDesiredConfig}
		/>,
	)
	isolated.inline('*')

	// It should render a collapsable with a titles
	const collapsable = isolated.findOne('section.collapsable').findOne('header')
	expect(collapsable.content()).toContain('Configuration Presets')

	// Open the collapsable
	isolated.findOne('section.collapsable').findOne('header').props.onClick({
		stopPropagation: jest.fn(),
		preventDefault: jest.fn(),
	})

	// Check about section
	expect(isolated.findOne('[data-test=about]').content()).toEqual(
		"Below are configuration presets that provide sensible defaults for typical application scenarios. Click 'Apply' to upload these settings to the asset.",
	)

	// Use walking preset
	const walking = isolated.findOne('[data-test=walking]')

	expect(walking.findOne('h5').content()).toEqual('Walking')

	expect(walking.findOne('p').content()).toEqual(
		'Use this to track people activities like walking. It records location every hour when not moving and every 3 minutes when on the move. The accelerometer is configured for light motion, like walking.',
	)

	walking.findOne('button').props.onClick()
	expect(setNewDesiredConfig).toHaveBeenCalledWith(presetConfigs.walking.config)

	// Use parcel preset
	const parcel = isolated.findOne('[data-test=parcel]')

	expect(parcel.findOne('h5').content()).toEqual('Parcel tracking')

	expect(parcel.findOne('p').content()).toEqual(
		'Use this if you want to track parcels. It records location every 24 hours when not moving and every 30 seconds when on the move. The accelerometer is configured for tracking movement of handling packages, but avoids tracking motion in vehicle.',
	)

	parcel.findOne('button').props.onClick()
	expect(setNewDesiredConfig).toHaveBeenCalledWith(presetConfigs.parcel.config)

	//Use driving presets
	const driving = isolated.findOne('[data-test=driving]')

	expect(driving.findOne('h5').content()).toEqual('Driving')
	expect(driving.findOne('p').content()).toEqual(
		'Use this to track people activities like driving. It records location every hour when not moving and every 1 minutes when on the move. The accelerometer is configured for driving.',
	)
})
