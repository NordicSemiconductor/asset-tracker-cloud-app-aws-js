import { type ConfigData } from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'
import type { DataModules } from 'asset/asset'
export const defaultConfig: ConfigData = {
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
		config: ConfigData
		label: string
		description: string
	}
> = {
	parcel: {
		config: {
			...defaultConfig,
			mvres: 30,
			accito: 10,
			mvt: 86400,
			accath: 11,
			accith: 7,
		},
		label: 'Parcel tracking',
		description:
			'Use this if you want to track parcels. It records location every 24 hours when not moving and every 30 seconds when on the move. The accelerometer is configured for tracking movement of handling packages, but avoids tracking motion in vehicle.',
	},
	walking: {
		config: {
			...defaultConfig,
			mvres: 180,
			accito: 60,
			mvt: 3600,
			accath: 5,
			accith: 4.5,
		},
		label: 'Walking',
		description:
			'Use this to track people activities like walking. It records location every hour when not moving and every 3 minutes when on the move. The accelerometer is configured for light motion, like walking.',
	},
	driving: {
		config: {
			...defaultConfig,
			mvres: 60,
			accito: 30,
			mvt: 3600,
			accath: 5,
			accith: 4.5,
		},
		label: 'Driving',
		description:
			'Use this to track vehicles. It records location every hour when not moving and every 1 minutes when on the move. The accelerometer is configured for vehicles.',
	},
}
