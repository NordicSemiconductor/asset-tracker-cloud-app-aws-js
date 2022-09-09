/**
 * @jest-environment jsdom
 */

import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import { configConstraints } from 'components/Asset/Settings/configConstraints.js'

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

		const formErrors: Record<string, string> = configConstraints(config)

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

		const formErrors: Record<string, string> = configConstraints(config)

		expect(formErrors['mvres']).toEqual(undefined)
		expect(formErrors['accito']).toEqual(undefined)
	})

	it("Should detect an error when 'Accelerometer activity threshold' is higher than 'Accelerometer inactivity threshold'", () => {
		const config: Static<typeof AssetConfig> = {
			act: true,
			actwt: 60,
			mvres: 300,
			mvt: 3600,
			gnsst: 60,
			accath: 1.5, // Accelerometer activity threshold
			accith: 5.7, // Accelerometer inactivity threshold
			accito: 1.2,
			nod: [],
		}

		const formValidationErrors: Record<string, string> =
			configConstraints(config)

		expect(formValidationErrors['accath']).toContain(
			`Value must be higher than Accelerometer inactivity threshold value: ${config.accith}`,
		)
		expect(formValidationErrors['accith']).toContain(
			`Value must be lower than Accelerometer activity threshold value: ${config.accath}`,
		)
	})

	it("Should not detect an error when 'Accelerometer activity threshold' is lower than 'Accelerometer inactivity threshold'", () => {
		const config: Static<typeof AssetConfig> = {
			act: true,
			actwt: 60,
			mvres: 300,
			mvt: 3600,
			gnsst: 60,
			accath: 10.5, // Accelerometer activity threshold
			accith: 5.7, // Accelerometer inactivity threshold
			accito: 1.2,
			nod: [],
		}

		const formErrors: Record<string, string> = configConstraints(config)

		expect(formErrors['accath']).toEqual(undefined)
		expect(formErrors['accith']).toEqual(undefined)
	})
})
