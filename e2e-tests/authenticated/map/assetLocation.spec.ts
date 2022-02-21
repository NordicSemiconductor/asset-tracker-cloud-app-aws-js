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

test('Map with asset location should be visible', async ({ page }) => {
	const mapMarker = page.locator('#asset-map .leaflet-marker-icon')
	const mapMarkerPopup = page.locator('#asset-map .leaflet-popup')

	// Map marker should be visible
	await expect(mapMarker).toBeVisible()
	await mapMarker.click()
	await expect(mapMarkerPopup).toBeVisible()
	const { name } = await loadSessionData('asset')
	await expect(mapMarkerPopup).toContainText(name)
	await page.screenshot({
		path: `./test-session/map-marker.png`,
	})

	// Zoom
	for (let i = 0; i < 5; i++) {
		await page.locator('.leaflet-control-zoom-in').click()
		await page.waitForTimeout(750)
	}

	// Click on location circle should show info
	const box = await page.locator('.asset-location-circle-0').boundingBox()
	const assetLocation = page.locator('.asset-location-circle-0')
	// Click a bit off-center
	await assetLocation.click({
		position: {
			x: (box?.width ?? 250) * 0.55,
			y: (box?.height ?? 250) * 0.55,
		},
	})

	await expect(
		page.locator('#asset-map .leaflet-popup:last-of-type'),
	).toBeVisible()

	// Verify location info
	await Promise.all(
		Object.entries({
			accuracy: '24.8 m',
			speed: '0.58 m/s',
			heading: '176.12°',
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
			rsrp: '(-97 dBm)',
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
		path: `./test-session/asset-location-info.png`,
	})
})
