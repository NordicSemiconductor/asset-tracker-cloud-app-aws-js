import type { Static, TSchema } from '@sinclair/typebox'
import { validPassthrough } from 'utils/validPassthrough.js'

type WithLocalStorage = {
	<Schema extends TSchema>(_: { schema: Schema; key: string }): {
		set: (_: Static<Schema>) => void
		get: () => Static<Schema> | undefined
		destroy: () => void
	}
	<Schema extends TSchema>(_: {
		schema: Schema
		key: string
		defaultValue: Static<Schema>
	}): {
		set: (_: Static<Schema>) => void
		get: () => Static<Schema>
		destroy: () => void
	}
}

export const withLocalStorage: WithLocalStorage = <Schema extends TSchema>({
	schema,
	key,
	defaultValue,
}: {
	schema: Schema
	key: string
	defaultValue?: Static<Schema>
}): {
	set: (_?: Static<Schema>) => void
	get: () => Static<Schema> | undefined
	destroy: () => void
} => {
	const destroy = () => localStorage.removeItem(key)
	const valid = validPassthrough(schema)
	return {
		set: (v) => {
			if (v === undefined) destroy()
			localStorage.setItem(key, JSON.stringify(v))
		},
		get: () => {
			const stored = localStorage.getItem(key)
			if (stored === null) return defaultValue
			try {
				return valid(JSON.parse(stored)) ?? defaultValue
			} catch {
				console.error(
					`[withLocalStorage] Failed to load stored entry for ${key} from ${stored}!`,
				)
				return defaultValue
			}
		},
		destroy,
	}
}
