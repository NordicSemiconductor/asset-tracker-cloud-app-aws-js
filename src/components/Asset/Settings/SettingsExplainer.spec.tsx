/**
 * @jest-environment jsdom
 */
import { defaultConfig } from 'asset/config.js'
import { SettingsExplainer } from 'components/Asset/Settings/SettingsExplainer.js'
import { isolateComponent } from 'isolate-react'

describe('SettingsExplainer()', () => {
	it('should display an explanation in text related to the config meaning', () => {
		const isolated = isolateComponent(
			<SettingsExplainer settings={defaultConfig} />,
		)

		const content = isolated.content()

		expect(content).toContain(
			'When in motion the tracker will send an update to the cloud every 5 minutes (300 s).',
		)
		expect(content).toContain(
			'When motion stops for more than 1 second (1.7 s), an update will be sent to the cloud',
		)
		expect(content).toContain(
			'If not in motion an update will be sent to the cloud every 1 hour (3600 s).',
		)
	})
})
