import type { Static } from '@sinclair/typebox'
import type { AssetConfig, DataModules } from 'asset/asset'

export const defaultConfig: Static<typeof AssetConfig> = {
	act: false, // Whether to enable the active mode
	actwt: 300, // In active mode: wait this amount of seconds until sending the next update. The actual interval will be this time plus the time it takes to get a GNSS fix.
	mvres: 300, // (movement resolution) In passive mode: Time in seconds to wait after detecting movement before sending the next update
	mvt: 3600, // (movement timeout) In passive mode: Send update at least this often (in seconds)
	loct: 60, // Location search timeout (in seconds): Timeout for location search (GNSS fix, cellular, and WiFi positioning).
	accath: 10, // Accelerometer activity threshold in m/s²: Minimal absolute value for an accelerometer reading to be considered movement.
	accith: 5, // Accelerometer Inactivity Threshold in m/s²: Maximum absolute value for an accelerometer reading to be considered stillness. Should be lower than the activity threshold.
	accito: 60, // Accelerometer Inactivity Timeout in s: Hysteresis timeout for stillness detection.
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
			...defaultConfig,
			mvres: 3600,
			accito: 1200,
			mvt: 21600,
			accath: 10,
			accith: 5,
		},
		label: 'Parcel tracking',
		description:
			'Use this if you want to track parcels. It records location every hour when not moving and every 20 minutes when on the move. The accelerometer is configured for motion in vehicles.',
	},
	walking: {
		config: {
			...defaultConfig,
			mvres: 300,
			accito: 60,
			mvt: 3600,
			accath: 3,
			accith: 1,
		},
		label: 'Walking',
		description:
			'Use this to track people activities like walking. It records location every hour when not moving and every 5 minutes when on the move. The accelerometer is configured for light motion, like walking.',
	},
}
