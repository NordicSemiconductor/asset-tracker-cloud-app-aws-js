import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'

export const verifyInfo =
	(
		page: Page,
		parentSelector: string,
		childSelector: (key: string) => string,
	) =>
	async (expectedData: Record<string, string>) => {
		await expect(page.locator(parentSelector)).toBeVisible()
		for (const [k, v] of Object.entries(expectedData)) {
			expect(
				page.locator(`${parentSelector} ${childSelector(k)}`),
			).toContainText(v)
		}
	}

export const verifyRoamingInfo = (page: Page) =>
	verifyInfo(
		page,
		'#asset-map .leaflet-popup:last-of-type',
		(k) => `[data-test="asset-roaming-info-${k}"]`,
	)

export const verifyLocationInfo = (page: Page) =>
	verifyInfo(
		page,
		'#asset-map .leaflet-popup:last-of-type',
		(k) => `[data-test="asset-location-info-${k}"]`,
	)
