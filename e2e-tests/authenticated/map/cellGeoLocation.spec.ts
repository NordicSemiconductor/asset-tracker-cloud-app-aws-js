import { test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'
import { offsetClick } from './helper/offsetClick.js'
import { updateSettings } from './helper/settings.js'
import { verifyLocationInfo, verifyRoamingInfo } from './helper/verifyInfo.js'
import { zoom } from './helper/zoom.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Show cell geo location on map', async ({ page }) => {
	await updateSettings(page)({
		gnssHistory: false,
		neighboringCell: false,
	})
	await zoom(page, -2)

	// Neighboring cell location circle should exist
	await offsetClick(page.locator('#asset-map path[fill="#F6C270"]'))
	// And popup should be shown
	await verifyLocationInfo(
		page,
		1,
	)({
		accuracy: '5000 m',
		source: 'Single cell geo location',
	})
	await verifyRoamingInfo(
		page,
		1,
	)({
		rsrp: '(-97 dBm)',
		nw: 'LTE-M',
		band: '20',
		mccmnc: '24201',
		area: '30401',
		cell: '30976',
		ip: '10.96.67.53',
	})
	await page.screenshot({
		path: `./test-session/cell-geo-location.png`,
	})
})
