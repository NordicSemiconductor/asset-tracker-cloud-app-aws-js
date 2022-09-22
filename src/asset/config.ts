import type { Static } from '@sinclair/typebox'
import type { AssetConfig, DataModules } from 'asset/asset'

export const defaultConfig: Static<typeof AssetConfig> = {
	act: false, // Whether to enable the active mode
	actwt: 300, // In active mode: wait this amount of seconds until sending the next update. The actual interval will be this time plus the time it takes to get a GNSS fix.
	mvres: 300, // (movement resolution) In passive mode: Time in seconds to wait after detecting movement before sending the next update
	mvt: 3600, // (movement timeout) In passive mode: Send update at least this often (in seconds)
	gnsst: 60, // GNSS timeout (in seconds): timeout for GNSS fix
	accath: 10, // Accelerometer activity threshold in m/s²: Minimal absolute value for an accelerometer reading to be considered movement.
	accith: 5, // Accelerometer inactivity threshold in m/s²: Maximum absolute value for an accelerometer reading to be considered stillness. Should be lower than the activity threshold.
	accito: 60, // Accelerometer inactivity timeout in s: Hysteresis timeout for stillness detection.
	nod: [] as DataModules[],
} as const

export const presetConfigs: Record<
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
		label: 'Parcel',
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
		label: 'Walking',
		description: 'Ideal to track walking activities as hiking for example.',
	},
}
