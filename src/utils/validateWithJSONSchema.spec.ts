import { Type } from '@sinclair/typebox'
import { validateWithJSONSchema } from 'utils/validateWithJSONSchema.js'

const typedInputSchema = Type.Object(
	{
		cell: Type.Number({
			minimum: 1,
		}),
	},
	{ additionalProperties: false },
)

describe('validateWithJSONSchema', () => {
	describe('it should validate', () => {
		const v = validateWithJSONSchema(typedInputSchema)
		it('valid input', () => {
			const isValid = v({ cell: 42 })
			expect('value' in isValid).toEqual(true)
			expect((isValid as any).value.cell).toEqual(42)
		})
		it('invalid input', () => {
			const isInvalid = v({ cell: -42 })
			expect('errors' in isInvalid).toEqual(true)
		})
	})
})
