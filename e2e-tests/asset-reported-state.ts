import { defaultConfig } from '../src/asset/defaultConfig.js'

const now = Date.now()

/**
 * @see https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/344a5a63945f7d9d14c8f37d4a96d6f666ba8148/docs/cloud-protocol/state.reported.aws.json
 */
export const state: Record<string, any> = {
	bat: {
		v: 2754,
		ts: now,
	},
	env: {
		v: {
			temp: 23.6,
			hum: 50.5,
			atmp: 100.36,
		},
		ts: now,
	},
	gnss: {
		v: {
			lng: 10.436642,
			lat: 63.421133,
			acc: 24.798573,
			alt: 170.528305,
			spd: 0.579327,
			hdg: 176.12,
		},
		ts: now,
	},
	cfg: defaultConfig,
	dev: {
		v: {
			imei: '352656106111232',
			iccid: '89450421180216216095',
			modV: 'mfw_nrf9160_1.0.0',
			brdV: 'thingy91_nrf9160',
			appV: 'v1.0.0-rc1-327-g6fc8c16b239f',
		},
		ts: now,
	},
	roam: {
		v: {
			band: 3,
			nw: 'NB-IoT',
			rsrp: -97,
			area: 12,
			mccmnc: 24202,
			cell: 33703719,
			ip: '10.81.183.99',
		},
		ts: now,
	},
} as const
