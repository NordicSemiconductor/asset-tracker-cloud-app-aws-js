/**
 * @jest-environment jsdom
 */
import { defaultConfig } from 'asset/config.js'
import { ConfigurationExplainer } from 'components/Asset/Configuration/ConfigurationExplainer.js'
import { isolateComponent } from 'isolate-react'

describe('ConfigurationExplainer()', () => {
	it('should display an explanation in text related to the config meaning', () => {
		const movementResClicked = jest.fn()
		const accelerometerInactivityClicked = jest.fn()
		const movementTimeoutClicked = jest.fn()

		const isolated = isolateComponent(
			<ConfigurationExplainer
				settings={defaultConfig}
				onMovementResolutionClicked={movementResClicked}
				onAccelerometerInactivityTimeoutClicked={accelerometerInactivityClicked}
				onMovementTimeoutClicked={movementTimeoutClicked}
			/>,
		)
		isolated.inline('*')

		const movementResolutionButton = isolated
			.findOne('[data-test=mvres]')
			.findOne('button')
		expect(movementResolutionButton.content()).toContain(
			'5 minutes (300 seconds)',
		)
		movementResolutionButton.props.onClick()
		expect(movementResClicked).toHaveBeenCalled()

		const accellerometrInactivityButton = isolated
			.findOne('[data-test=accito]')
			.findOne('button')
		expect(accellerometrInactivityButton.content()).toContain(
			'1 minute (60 seconds)',
		)
		accellerometrInactivityButton.props.onClick()
		expect(movementResClicked).toHaveBeenCalled()

		const movementTimeoutButton = isolated
			.findOne('[data-test=mvt]')
			.findOne('button')
		expect(movementTimeoutButton.content()).toContain('1 hour (3600 seconds)')
		movementTimeoutButton.props.onClick()
		expect(movementResClicked).toHaveBeenCalled()
	})
})
