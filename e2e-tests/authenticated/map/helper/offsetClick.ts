import type { Locator } from '@playwright/test'
import { expect } from '@playwright/test'

/**
 * Click a bit off-center because a marker may be blocking the click on a circle because it is directly in the center.
 */
export const offsetClick = async (
	locator: Locator,
	offset = 0.75,
): Promise<void> => {
	const { width, height } = (await locator.boundingBox()) ?? {}
	expect(width).toBeGreaterThan(0)
	expect(height).toBeGreaterThan(0)
	await locator.click({
		position: {
			x: (width as number) * offset,
			y: (height as number) * offset,
		},
	})
}
