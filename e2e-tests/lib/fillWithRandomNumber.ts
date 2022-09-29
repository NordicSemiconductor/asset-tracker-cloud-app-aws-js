import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Fill a number input field with a random value, honoring the min, max, and step attributes if present.
 */
export const fillWithRandomNumber = async (
	page: Page,
	locator: string,
): Promise<number> => {
	const input = page.locator(locator)
	const type = await input.getAttribute('type')
	expect(type).toEqual('number')
	const min = parseFloat((await input.getAttribute('min')) ?? '0')
	const max = parseFloat(
		(await input.getAttribute('max')) ?? Number.MAX_SAFE_INTEGER.toString(),
	)
	const stepDef = (await input.getAttribute('step')) ?? '1'
	const step = parseFloat(stepDef)
	const v = Math.random() * max - min
	const stepped = v - (v % step)
	await page.fill(locator, stepped.toString())
	return stepped
}
