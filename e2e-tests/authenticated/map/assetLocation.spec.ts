import { test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'
import { offsetClick } from './helper/offsetClick.js'
import { verifyLocationInfo, verifyRoamingInfo } from './helper/verifyInfo.js'
import { verifyMapMarker } from './helper/verifyMapMarker.js'
import { zoom } from './helper/zoom.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Map with asset location should be visible', async ({ page }) => {
	await verifyMapMarker(page)

	await page.screenshot({
		path: `./test-session/map-marker.png`,
	})

	await zoom(page, 4)

	// Click on location circle should show info
	const circle = page.locator('.asset-location-circle-0')
	await offsetClick(circle)
	await verifyLocationInfo(page)({
		accuracy: '24.8 m',
		speed: '0.58 m/s',
		heading: '176.12°',
		source: 'GNSS',
	})
	await verifyRoamingInfo(page)({
		rsrp: '(-97 dBm)',
		nw: 'LTE-M',
		band: '20',
		mccmnc: '24201',
		area: '30401',
		cell: '30976',
		ip: '10.96.67.53',
	})
	await page.screenshot({
		path: `./test-session/asset-location-info.png`,
	})
})
