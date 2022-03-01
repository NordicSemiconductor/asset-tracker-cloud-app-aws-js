import { Page } from '@playwright/test'

export const center = async (page: Page) =>
	page.locator(`button[title="Center map on asset"]`).click()
