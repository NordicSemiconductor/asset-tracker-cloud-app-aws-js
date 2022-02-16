import type { Static, TSchema } from '@sinclair/typebox'
import { validateWithJSONSchema } from 'utils/validateWithJSONSchema.js'

export const validPassthrough = <T extends TSchema>(
	schema: T,
): ((v: Static<typeof schema>) => Static<typeof schema> | undefined) => {
	const validator = validateWithJSONSchema(schema)
	return (v: Static<typeof schema>): Static<typeof schema> | undefined => {
		const isValid = validator(v)
		if ('errors' in isValid) {
			console.debug(
				'[validPassthrough]',
				'Dropped',
				v,
				{ schema },
				{
					errors: isValid.errors,
				},
			)
			return
		}
		return v
	}
}
