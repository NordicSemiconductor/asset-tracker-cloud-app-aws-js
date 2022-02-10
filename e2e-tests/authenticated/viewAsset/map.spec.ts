import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { loadSessionData } from '../../lib/loadSessionData.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.beforeEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Map with device location should be visible', async ({ page }) => {
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
		await page.waitForTimeout(500)
	}

	// Click on location circle should show info
	const assetLocation = page.locator('.asset-location-circle-0')
	const size = await assetLocation.boundingBox()
	await assetLocation.click({
		position: {
			x: (size?.width ?? 500) * 0.75,
			y: (size?.height ?? 500) * 0.75,
		},
	})
	await expect(
		page.locator('#asset-map .leaflet-popup:last-of-type'),
	).toBeVisible()
	await expect(
		page.locator(
			'#asset-map .leaflet-popup:last-of-type [data-test="asset-location-info-accuracy"]',
		),
	).toContainText('24.8 m')
	await expect(
		page.locator(
			'#asset-map .leaflet-popup:last-of-type [data-test="asset-location-info-speed"]',
		),
	).toContainText('0.58 m/s')
	await expect(
		page.locator(
			'#asset-map .leaflet-popup:last-of-type [data-test="asset-location-info-heading"]',
		),
	).toContainText('176.12°')
	await page.screenshot({
		path: `./test-session/asset-location-info.png`,
	})
})

test('Show map settings', async ({ page }) => {
	await page.click('button[data-test="show-map-settings"]')
	await expect(page.locator('#mapSettingsFollow')).toBeChecked()
	await expect(page.locator('#mapSettingsSingleCellLocations')).toBeChecked()
	await expect(page.locator('#mapSettingsMultiCellLocations')).toBeChecked()
	await expect(page.locator('#mapSettingsHeadings')).not.toBeChecked()
	await expect(page.locator('#mapSettingsFetchHistory')).not.toBeChecked()
	await page.screenshot({
		path: `./test-session/map-settings.png`,
	})
})
