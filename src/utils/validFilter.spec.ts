import { Type } from '@sinclair/typebox'
import { validFilter } from 'utils/validFilter.js'

const typedInputSchema = Type.Object(
	{
		cell: Type.Number({
			minimum: 1,
		}),
	},
	{ additionalProperties: false },
)

describe('validFilter', () => {
	describe('it should validate', () => {
		const v = validFilter(typedInputSchema)
		it('valid input', () => {
			const isValid = v({ cell: 42 })
			expect(isValid).toEqual(true)
		})
		it('invalid input', () => {
			const isInvalid = v({ cell: -42 })
			expect(isInvalid).toEqual(false)
		})
	})
})
