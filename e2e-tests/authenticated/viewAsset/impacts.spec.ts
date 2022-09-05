import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Impacts history', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Impacts")')
	await expect(page.locator('.historical-data-chart.impacts')).toBeVisible({
		timeout: 30000,
	})
	await page.screenshot({
		fullPage: true,
		path: `./test-session/impacts-chart.png`,
	})
})
