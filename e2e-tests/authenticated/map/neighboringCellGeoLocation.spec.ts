import { test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'
import { offsetClick } from './helper/offsetClick.js'
import { updateSettings } from './helper/settings.js'
import { verifyLocationInfo } from './helper/verifyInfo.js'
import { zoom } from './helper/zoom.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Show neighboring cells geo location on map', async ({ page }) => {
	await updateSettings(page)({
		gnssHistory: false,
		singleCell: false,
	})
	await zoom(page, -1)

	// Neighboring cell location circle should exist
	await offsetClick(page.locator('#asset-map path[fill="#E56399"]'))
	// And popup should be shown
	await verifyLocationInfo(
		page,
		1,
	)({
		accuracy: '2000 m',
		source: 'Neighboring cell geo location',
	})
	await page.screenshot({
		path: `./test-session/neighboring-cells-geo-location.png`,
	})
})
