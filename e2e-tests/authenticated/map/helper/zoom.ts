import { Page } from '@playwright/test'

export const zoom = async (page: Page, levels: number) => {
	const zoomButton = page.locator(
		levels > 0 ? '.leaflet-control-zoom-in' : '.leaflet-control-zoom-out',
	)
	for (let i = 0; i <= Math.abs(levels); i++) {
		await zoomButton.click()
		await page.waitForTimeout(750)
	}
}
