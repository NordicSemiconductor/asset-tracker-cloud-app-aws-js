import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Show cell geo location on map', async ({ page }) => {
	// Neighboring cell location circle should exist
	await page.click('#asset-map path[stroke="#F6C270"]')
	// And popup should be shown
	await expect(
		page.locator(
			"text=Approximate location based on asset's cell information.",
		),
	).toBeVisible()

	await page.screenshot({
		path: `./test-session/cell-geo-location.png`,
	})
})
