import type { Page } from '@playwright/test'

export const center = async (page: Page): Promise<void> =>
	page.locator(`button[title="Center map on asset"]`).click()
