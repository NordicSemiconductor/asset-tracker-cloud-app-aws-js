/**
 * @jest-environment jsdom
 */

import { defaultConfig, presetConfigs } from 'asset/config.js'
import { validateConfig } from 'asset/validateConfig.js'

describe('validateConfig()', () => {
	it("Should detect an error when 'Movement resolution' is higher than 'Accelerometer Inactivity Timeout'", () =>
		expect(
			validateConfig({
				...defaultConfig,
				mvres: 1, // Movement resolution
				accito: 1.2, // Accelerometer Inactivity Timeout
			}),
		).toMatchObject({
			mvres: `Value must be higher than accelerometer inactivity timeout value: 1.2`,
			accito: `Value must be lower than Movement Resolution value: 1`,
		}))

	it("Should not detect an error when 'Accelerometer Inactivity Timeout' is lower than 'Movement resolution'", () =>
		expect(
			validateConfig({
				...defaultConfig,
				mvres: 10, // Movement resolution
				accito: 1.2, // Accelerometer Inactivity Timeout
			}),
		).toMatchObject({}))

	it("Should detect an error when 'Accelerometer Activity Threshold' is higher than 'Accelerometer Inactivity Threshold'", () =>
		expect(
			validateConfig({
				...defaultConfig,
				accath: 1.5, // Accelerometer Activity Threshold
				accith: 5.7, // Accelerometer Inactivity Threshold
			}),
		).toMatchObject({
			accath: `Value must be higher than Accelerometer Inactivity Threshold value: 5.7`,
			accith: `Value must be lower than Accelerometer Activity Threshold value: 1.5`,
		}))

	it("Should not detect an error when 'Accelerometer Activity Threshold' is lower than 'Accelerometer Inactivity Threshold'", () =>
		expect(
			validateConfig({
				...defaultConfig,
				accath: 10.5, // Accelerometer Activity Threshold
				accith: 5.7, // Accelerometer Inactivity Threshold
			}),
		).toMatchObject({}))

	test.each(Object.values(presetConfigs))(
		'that presets are valid',
		(preset) => {
			const errors = validateConfig(preset.config)
			expect(Object.keys(errors)).toHaveLength(0)
		},
	)
})
