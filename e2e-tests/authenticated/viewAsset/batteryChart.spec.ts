import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Battery history', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Battery")')
	await expect(
		page.locator('.historical-data-chart.battery-history'),
	).toBeVisible()
	await page.screenshot({
		fullPage: true,
		path: `./test-session/battery-chart.png`,
	})
})
