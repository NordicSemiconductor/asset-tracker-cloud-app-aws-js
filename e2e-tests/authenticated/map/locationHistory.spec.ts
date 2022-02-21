import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { loadSessionData } from '../../lib/loadSessionData.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Map with historical device location should be visible', async ({
	page,
}) => {
	// Enable history and turn off cell geo location
	await page.locator('[data-test="show-map-settings"]').click()
	await page.locator('input[name="fetchHistoricalData"]').check()
	await page.locator('[data-test="show-map-settings"]').click()

	const mapMarker = page.locator('#asset-map .leaflet-marker-icon')
	const mapMarkerPopup = page.locator('#asset-map .leaflet-popup')

	// Map marker should be visible
	await expect(mapMarker).toBeVisible()
	await mapMarker.click()
	await expect(mapMarkerPopup).toBeVisible()
	const { name } = await loadSessionData('asset')
	await expect(mapMarkerPopup).toContainText(name)

	// Location history should be visible
	await expect(page.locator('.asset-location-circle-8')).toBeVisible()

	await page.screenshot({
		path: `./test-session/map-historical-locations.png`,
	})

	// Zoom
	for (let i = 0; i < 2; i++) {
		await page.locator('.leaflet-control-zoom-in').click()
		await page.waitForTimeout(750)
	}

	// Center
	await page.locator(`button[title="Center map on asset"]`).click()

	// Click on third location circle should show info
	const location2 = page.locator('.asset-location-circle-2')
	await page.waitForSelector('.asset-location-circle-2')
	const box2 = await location2.boundingBox()
	// Click a bit off-center
	await location2.click({
		position: {
			x: (box2?.width ?? 150) * 0.55,
			y: (box2?.height ?? 150) * 0.55,
		},
	})
	await expect(
		page.locator('#asset-map .leaflet-popup:last-of-type'),
	).toBeVisible()

	// Verify location info
	await Promise.all(
		Object.entries({
			accuracy: '50 m',
			speed: '10 m/s',
			heading: '32.23°',
		}).map(async ([k, v]) =>
			expect(
				page.locator(
					`#asset-map .leaflet-popup:last-of-type [data-test="asset-location-info-${k}"]`,
				),
			).toContainText(v),
		),
	)

	// Verify roaming info
	await Promise.all(
		Object.entries({
			rsrp: '(-99 dBm)',
			nw: 'LTE-M',
			band: '20',
			mccmnc: '24201',
			area: '30401',
			cell: '30976',
			ip: '10.96.67.53',
		}).map(async ([k, v]) =>
			expect(
				page.locator(
					`#asset-map .leaflet-popup:last-of-type [data-test="asset-roaming-info-${k}"]`,
				),
			).toContainText(v),
		),
	)

	await page.screenshot({
		path: `./test-session/map-historical-locations-2.png`,
	})

	// Should have different RSRP
	const location3 = page.locator('.asset-location-circle-3')
	const box3 = await location3.boundingBox()
	// Click a bit off-center
	await location3.click({
		position: {
			x: (box3?.width ?? 150) * 0.55,
			y: (box3?.height ?? 150) * 0.55,
		},
	})
	await expect(
		page.locator(
			`#asset-map .leaflet-popup:last-of-type [data-test="asset-roaming-info-rsrp"]`,
		),
	).toContainText('(-97 dBm)')

	await page.screenshot({
		path: `./test-session/map-historical-locations-3.png`,
	})
})
