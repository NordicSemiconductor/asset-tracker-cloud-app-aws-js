import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../../lib.js'
import { center } from '../helper/center.js'
import { offsetClick } from '../helper/offsetClick.js'
import { verifyLocationInfo, verifyRoamingInfo } from '../helper/verifyInfo.js'
import { verifyMapMarker } from '../helper/verifyMapMarker.js'
import { zoom } from '../helper/zoom.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Map with historical GNSS asset location should be visible', async ({
	page,
}) => {
	// Enable GNSS history
	await page.locator('[data-test="show-map-settings"]').click()
	await page.locator('input[name="mapSettingsFetchGNSSHistory"]').check()
	await page.locator('[data-test="show-map-settings"]').click()

	await verifyMapMarker(page)

	// Location history should be visible
	await expect(page.locator('.asset-location-circle-8')).toBeVisible()

	await page.screenshot({
		path: `./test-session/map-historical-gnss-locations.png`,
	})

	await zoom(page, 1)

	// Center
	await center(page)

	// Click on third location circle should show info
	const location2 = page.locator('.asset-location-circle-2')
	await location2.waitFor()
	await offsetClick(location2)
	await verifyLocationInfo(page)({
		accuracy: '50 m',
		speed: '10 m/s',
		heading: '32.23°',
		source: 'GNSS',
	})
	await verifyRoamingInfo(page)({
		rsrp: '(-99 dBm)',
		nw: 'LTE-M',
		band: '20',
		mccmnc: '24201',
		area: '30401',
		cell: '30976',
		ip: '10.96.67.53',
	})
	await page.screenshot({
		path: `./test-session/map-historical-gnss-locations-2.png`,
	})

	// Should have different RSRP
	const location3 = page.locator('.asset-location-circle-3')
	await location3.waitFor()
	await offsetClick(location3)
	await verifyRoamingInfo(page)({
		rsrp: '(-97 dBm)',
	})
	await page.screenshot({
		path: `./test-session/map-historical-gnss-locations-3.png`,
	})
})
