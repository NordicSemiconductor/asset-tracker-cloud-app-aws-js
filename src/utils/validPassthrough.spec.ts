import { Type } from '@sinclair/typebox'
import { validPassthrough } from 'utils/validPassthrough.js'

const typedInputSchema = Type.Object(
	{
		cell: Type.Number({
			minimum: 1,
		}),
	},
	{ additionalProperties: false },
)

describe('validPassthrough', () => {
	describe('it should validate', () => {
		const v = validPassthrough(typedInputSchema)
		it('valid input', () => {
			const isValid = v({ cell: 42 })
			expect((isValid as any).cell).toEqual(42)
		})
		it('invalid input', () => {
			const isInvalid = v({ cell: -42 })
			expect(isInvalid).toBeUndefined()
		})
	})
})
