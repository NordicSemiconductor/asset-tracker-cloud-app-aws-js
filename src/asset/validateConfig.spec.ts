/**
 * @jest-environment jsdom
 */

import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
//import { presetConfigs } from 'asset/config'
import { validateConfig } from 'asset/validateConfig.js'

// TODO: use import { presetConfigs } from 'asset/config'
const presetConfigs: Record<
	string,
	{
		config: Static<typeof AssetConfig>
		label: string
		description: string
	}
> = {
	parcel: {
		config: {
			act: false, // passive mode
			mvres: 3600, // movement resolution
			accath: 10, // Accelerometer activity threshold
			accith: 5, // Accelerometer inactivity threshold
			accito: 1200, // Accelerometer inactivity timeout
			mvt: 21600, // Movement Timeout
			actwt: 10,
			gnsst: 10,
			nod: [],
		},
		label: 'Parcel Config',
		description: 'Used for tracking parcels.',
	},
	walking: {
		config: {
			act: false, // passive mode
			mvres: 300, // movement resolution
			accath: 10, // Accelerometer activity threshold
			accith: 5, // Accelerometer inactivity threshold
			accito: 60, // Accelerometer inactivity timeout
			mvt: 3600, // Movement Timeout
			actwt: 10,
			gnsst: 10,
			nod: [],
		},
		label: 'Walking Config',
		description: 'When you want to track your hiking.',
	},
}

describe('configConstraints()', () => {
	it("Should detect an error when 'Movement resolution' is higher than 'Accelerometer inactivity timeout'", () => {
		const config: Static<typeof AssetConfig> = {
			act: true,
			actwt: 60,
			mvres: 1, // Movement resolution
			accito: 1.2, // Accelerometer inactivity timeout
			mvt: 3600,
			gnsst: 60,
			accath: 10.5,
			accith: 5.7,
			nod: [],
		}

		const formErrors: Record<string, string> = validateConfig(config)

		expect(formErrors['mvres']).toContain(
			`Value must be higher than accelerometer inactivity timeout value: ${config.accito}`,
		)
		expect(formErrors['accito']).toContain(
			`Value must be lower than Movement Resolution value: ${config.mvres}`,
		)
	})

	it("Should not detect an error when 'Accelerometer inactivity timeout' is lower than 'Movement resolution'", () => {
		const config: Static<typeof AssetConfig> = {
			act: true,
			actwt: 60,
			mvres: 10, // Movement resolution
			accito: 1.2, // Accelerometer inactivity timeout
			mvt: 3600,
			gnsst: 60,
			accath: 10.5,
			accith: 5.7,
			nod: [],
		}

		const formErrors: Record<string, string> = validateConfig(config)

		expect(formErrors['mvres']).toEqual(undefined)
		expect(formErrors['accito']).toEqual(undefined)
	})

	it("Should detect an error when 'Accelerometer Activity Threshold' is higher than 'Accelerometer inactivity threshold'", () => {
		const config: Static<typeof AssetConfig> = {
			act: true,
			actwt: 60,
			mvres: 300,
			mvt: 3600,
			gnsst: 60,
			accath: 1.5, // Accelerometer Activity Threshold
			accith: 5.7, // Accelerometer inactivity threshold
			accito: 1.2,
			nod: [],
		}

		const formValidationErrors: Record<string, string> = validateConfig(config)

		expect(formValidationErrors['accath']).toContain(
			`Value must be higher than Accelerometer inactivity threshold value: ${config.accith}`,
		)
		expect(formValidationErrors['accith']).toContain(
			`Value must be lower than Accelerometer Activity Threshold value: ${config.accath}`,
		)
	})

	it("Should not detect an error when 'Accelerometer Activity Threshold' is lower than 'Accelerometer inactivity threshold'", () => {
		const config: Static<typeof AssetConfig> = {
			act: true,
			actwt: 60,
			mvres: 300,
			mvt: 3600,
			gnsst: 60,
			accath: 10.5, // Accelerometer Activity Threshold
			accith: 5.7, // Accelerometer inactivity threshold
			accito: 1.2,
			nod: [],
		}

		const formErrors: Record<string, string> = validateConfig(config)

		expect(formErrors['accath']).toEqual(undefined)
		expect(formErrors['accith']).toEqual(undefined)
	})

	it('Should check preset configs do not create conflict with configuration constraints', () => {
		const errors = Object.keys(presetConfigs).map((element) =>
			validateConfig(presetConfigs[`${element}`].config),
		)
		const checkErros = errors.reduce((accumulator: any, currentValue) => {
			const error: any = Object.keys(currentValue)
			return (accumulator =
				error.length === 0 ? accumulator : [...accumulator, ...error])
		}, [])

		expect(checkErros.length).toEqual(0)
	})
})
