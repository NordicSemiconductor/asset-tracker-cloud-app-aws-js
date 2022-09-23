import { explainDuration } from 'components/Asset/Settings/explainDuration.js'

describe('explainDuration', () => {
	it.each([[300, '5 minutes (300 seconds)']])(
		'should explain a duration in seconds',
		(duration, expected) => expect(explainDuration(duration)).toEqual(expected),
	)
	it('should return a help text if the duration is not a number', () =>
		expect(explainDuration(NaN)).toEqual('... click here to fill input'))
	it('should return a help text if the duration is undefined', () =>
		expect(explainDuration(undefined as any)).toEqual(
			'... click here to fill input',
		))
})
