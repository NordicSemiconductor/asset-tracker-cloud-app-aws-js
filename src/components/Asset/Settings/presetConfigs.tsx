import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'

export const parcelConfig = {
	act: false, // passive mode
	mvres: 3600, // movement resolution
	accath: 10, // Accelerometer activity threshold
	accith: 5, // Accelerometer inactivity threshold
	accito: 1200, // Accelerometer inactivity timeout
	mvt: 21600, // Movement Timeout
	actwt: 10,
	gnsst: 10,
	nod: [],
}

export const walkingConfig = {
	act: false, // passive mode
	mvres: 300, // movement resolution
	accath: 10, // Accelerometer activity threshold
	accith: 5, // Accelerometer inactivity threshold
	accito: 60, // Accelerometer inactivity timeout
	mvt: 3600, // Movement Timeout
	actwt: 10,
	gnsst: 10,
	nod: [],
}

export const presetConfigs: Record<string, Static<typeof AssetConfig>> = {
	parcel: {
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
	walking: {
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
}
