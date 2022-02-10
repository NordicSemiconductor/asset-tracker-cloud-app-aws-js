import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.beforeEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Show neighboring cells geo location on map', async ({ page }) => {
	// Neighboring cell location circle should exist
	await page.click('#asset-map path[stroke="#E56399"]')
	// And popup should be shown
	await expect(
		page.locator(
			'text=Approximate location based on neighboring cell information.',
		),
	).toBeVisible()
	await page.screenshot({
		path: `./test-session/neighboring-cells-geo-location.png`,
	})
})
