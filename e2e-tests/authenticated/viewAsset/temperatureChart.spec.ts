import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.beforeEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Temperature history', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Temperature")')
	await expect(
		page.locator('.historical-data-chart.temperature-history'),
	).toBeVisible()
	await page.screenshot({
		fullPage: true,
		path: `./test-session/temperature-chart.png`,
	})
})
