import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'

export const validateConfig = (
	config: Static<typeof AssetConfig>,
): Record<string, string> => {
	const errors: Record<string, string> = {}

	// Movement resolution must be higher than Accelerometer inactivity timeout
	if (config.mvres <= config.accito) {
		errors.mvres = `Value must be higher than accelerometer inactivity timeout value: ${config.accito}`
		errors.accito = `Value must be lower than Movement Resolution value: ${config.mvres}`
	}

	// Accelerometer Activity Threshold must be higher than Accelerometer inactivity threshold
	if (config.accath <= config.accith) {
		errors.accath = `Value must be higher than Accelerometer inactivity threshold value: ${config.accith}`
		errors.accith = `Value must be lower than Accelerometer Activity Threshold value: ${config.accath}`
	}
	return errors
}
