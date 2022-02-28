import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Show map settings', async ({ page }) => {
	await page.click('button[data-test="show-map-settings"]')
	await expect(page.locator('#mapSettingsFollow')).toBeChecked()
	await expect(page.locator('#mapSettingsSingleCellGeoLocations')).toBeChecked()
	await expect(page.locator('#mapSettingsMultiCellGeoLocations')).toBeChecked()
	await expect(page.locator('#mapSettingsHeadings')).not.toBeChecked()
	await expect(page.locator('#mapSettingsFetchGNSSHistory')).not.toBeChecked()
	await page.screenshot({
		path: `./test-session/map-settings.png`,
	})
})
