import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const verifyInfo =
	(page: Page, childSelector: (key: string) => string) =>
	async (expectedData: Record<string, string>): Promise<void> => {
		for (const [k, v] of Object.entries(expectedData)) {
			const e = page.locator(childSelector(k))
			await expect(e).toBeVisible()
			await expect(e).toContainText(v)
		}
	}

export const verifyRoamingInfo = (
	page: Page,
	locationId: number,
): ((expectedData: Record<string, string>) => Promise<void>) =>
	verifyInfo(page, (k) => `[data-test="asset-roaming-info-${locationId}-${k}"]`)

export const verifyLocationInfo = (
	page: Page,
	locationId: number,
): ((expectedData: Record<string, string>) => Promise<void>) =>
	verifyInfo(
		page,
		(k) => `[data-test="asset-location-info-${locationId}-${k}"]`,
	)
