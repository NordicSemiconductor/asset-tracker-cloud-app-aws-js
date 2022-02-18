import type { Static, TSchema } from '@sinclair/typebox'
import { validPassthrough } from 'utils/validPassthrough.js'

export const validFilter = <T extends TSchema>(
	schema: T,
): ((v: Static<typeof schema>) => boolean) => {
	const validator = validPassthrough(schema)
	return (v: Static<typeof schema>): boolean => validator(v) !== undefined
}
