/**
 * @jest-environment jsdom
 */
import { defaultConfig } from 'asset/config.js'
import { ConfigurationExplainer } from 'components/Asset/Configuration/ConfigurationExplainer.js'
import { isolateComponent } from 'isolate-react'

describe('ConfigurationExplainer()', () => {
	it('should display an explanation in text related to the config meaning', () => {
		const mvresMockFocus = jest.fn()
		const accitoMockFocus = jest.fn()
		const mvtMockFocus = jest.fn()

		const settingsExplainer = isolateComponent(
			<ConfigurationExplainer
				settings={defaultConfig}
				mvresRef={
					{
						current: {
							focus: mvresMockFocus,
						},
					} as any
				}
				accitoRef={
					{
						current: {
							focus: accitoMockFocus,
						},
					} as any
				}
				mvtRef={
					{
						current: {
							focus: mvtMockFocus,
						},
					} as any
				}
			/>,
		)

		const mvres = settingsExplainer.findOne('#mvres-config-explainer')
		const mvresRefLink = mvres.findOne('TextAsButton')
		const mvresText = `${mvres.children[0].type}${mvresRefLink.content()}`
		expect(mvresText).toContain(
			'When in motion the tracker will send an update to the cloud every 5 minutes (300 seconds)',
		)
		mvresRefLink.props.onClick()
		expect(mvresMockFocus).toHaveBeenCalled()

		const accito = settingsExplainer.findOne('#accito-config-explainer')
		const accitoRefLink = accito.findOne('TextAsButton')
		const accitoText = `${accito.children[0].type}${accitoRefLink.content()}${
			accito.children[2].type
		}`
		expect(accitoText).toContain(
			'When motion stops for more than 1 minute (60 seconds), an update will be sent to the cloud',
		)
		accitoRefLink.props.onClick()
		expect(mvresMockFocus).toHaveBeenCalled()

		const mvt = settingsExplainer.findOne('#mvt-config-explainer')
		const mvtRefLink = mvt.findOne('TextAsButton')
		const mvtText = `${mvt.children[0].type}${mvtRefLink.content()}`
		expect(mvtText).toContain(
			'If not in motion an update will be sent to the cloud every 1 hour (3600 seconds)',
		)
		mvtRefLink.props.onClick()
		expect(mvresMockFocus).toHaveBeenCalled()
	})
})
