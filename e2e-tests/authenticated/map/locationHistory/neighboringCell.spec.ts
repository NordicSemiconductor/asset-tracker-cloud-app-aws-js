import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../../lib/checkForConsoleErrors.js'
import { AssetType, selectCurrentAsset } from '../../lib.js'
import { offsetClick } from '../helper/offsetClick.js'
import { updateSettings } from '../helper/settings.js'
import { verifyLocationInfo, verifyRoamingInfo } from '../helper/verifyInfo.js'
import { verifyMapMarker } from '../helper/verifyMapMarker.js'
import { zoom } from '../helper/zoom.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset(AssetType.NoGNSS))

test('Map with historical neighboring cell asset location should be visible', async ({
	page,
}) => {
	// Enable neighboring cell location history
	await updateSettings(page)({
		singleCell: false,
		neighboringCell: true,
		neighboringCellHistory: true,
		follow: false,
	})

	await zoom(page, -4)

	await verifyMapMarker(page, AssetType.NoGNSS)

	// Location history should be visible
	const location0 = page.locator('.asset-location-circle-0')
	const location1 = page.locator('.asset-location-circle-3')
	await expect(location0).toBeVisible()
	await expect(location1).toBeVisible()

	await page.screenshot({
		path: `./test-session/map-historical-neighboring-cell-locations.png`,
	})

	// Click on first location circle should show info
	await offsetClick(location0)

	await page.screenshot({
		path: `./test-session/map-historical-neighboring-cell-locations-0.png`,
	})

	await verifyLocationInfo(
		page,
		0,
	)({
		accuracy: '2000 m',
		source: 'Neighboring cell geo location',
	})

	await verifyRoamingInfo(
		page,
		0,
	)({
		rsrp: '(-82 dBm)',
		nw: 'LTE-M',
		mccmnc: '24201',
		area: '30401',
		cell: '30976',
	})

	// Click on first location circle should show info
	await offsetClick(location1)

	await page.waitForTimeout(500)

	await page.screenshot({
		path: `./test-session/map-historical-neighboring-cell-locations-1.png`,
	})

	await verifyLocationInfo(
		page,
		3,
	)({
		accuracy: '1174 m',
		source: 'Neighboring cell geo location',
	})

	await verifyRoamingInfo(
		page,
		3,
	)({
		rsrp: '(-71 dBm)',
		nw: 'LTE-M',
		mccmnc: '24201',
		area: '31801',
		cell: '18933760',
	})
})
