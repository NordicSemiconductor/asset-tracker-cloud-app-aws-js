import { expect, test } from '@playwright/test'
import * as path from 'path'
import { state as reported } from '../asset-reported-state.js'
import { loadSessionData } from '../lib/loadSessionData.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.beforeEach(async ({ page }) => {
	const { name } = await loadSessionData('asset')

	await page.goto('http://localhost:8080/')
	const assetLink = page.locator(`text=${name}`)
	await assetLink.waitFor()

	while ((await assetLink.count()) === 0) {
		console.debug(`Link to device ${name} not visible, load next page`)
		const loadMoreButton = page.locator(
			`button:not(disabled):has-text("Load more")`,
		)
		await loadMoreButton.waitFor()
		await loadMoreButton.click()
	}

	expect(await assetLink.count()).toEqual(1)
	await page.screenshot({ fullPage: true, path: `./test-session/assets.png` })

	await assetLink.click()
})

test('Title should contain asset name', async ({ page }) => {
	const { name } = await loadSessionData('asset')
	await expect(page.locator('.navbar-brand')).toContainText(name)
})

test('Asset Information', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Asset Information")')

	// Check device information
	for (const prop of ['imei', 'iccid', 'modV', 'brdV', 'appV']) {
		await expect(
			page.locator(`#asset-information [data-test="dev-${prop}"]`),
		).toContainText(reported.dev.v[prop])
	}

	// Check roaming information
	for (const prop of ['nw', 'band', 'rsrp', 'mccmnc', 'area', 'cell', 'ip']) {
		await expect(
			page.locator(`#asset-information [data-test="roam-${prop}"]`),
		).toContainText(reported.roam.v[prop].toString())
	}

	await page.screenshot({
		fullPage: true,
		path: `./test-session/asset-info.png`,
	})
})

test('Info header should show device information', async ({ page }) => {
	// Connection info
	const connInfoLocator = page.locator(
		`#info-header [data-test="connection-info"]`,
	)
	await expect(connInfoLocator).toContainText('-97 dBm')
	await expect(connInfoLocator).toContainText('Telia')
	await expect(connInfoLocator).toContainText('NB-IoT')
	await expect(connInfoLocator).toContainText('Telia Sonera A/S')

	// GNSS info
	const gnssInfoLocator = page.locator(`#info-header [data-test="gnss-info"]`)
	await expect(gnssInfoLocator).toContainText('1 m/s')
	await expect(gnssInfoLocator).toContainText('171 m')

	// Battery info
	const batteryInfoLocator = page.locator(
		`#info-header [data-test="battery-info"]`,
	)
	await expect(batteryInfoLocator).toContainText('2.754 V')

	// Env info
	const environmentInfoLocator = page.locator(
		`#info-header [data-test="environment-info"]`,
	)
	await expect(environmentInfoLocator).toContainText('23.6°C')
	await expect(environmentInfoLocator).toContainText('51%')
	await expect(environmentInfoLocator).toContainText('1004 hPa')
})

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

test('Map should be vertically resizable', async ({ page }) => {
	const mapContainer = page.locator('#map-container')
	const resizeBtn = page.locator('#map-container-resize')

	if (resizeBtn !== undefined && mapContainer !== undefined) {
		const mapContainerBounding = await mapContainer.boundingBox()
		const resizeSrc = await resizeBtn.boundingBox()
		const resizeDst = {
			x: 18,
			y: 368,
			width: 25,
			height: 25,
		}
		if (resizeSrc !== undefined && resizeSrc !== null) {
			await page.mouse.move(
				resizeSrc?.x ?? 0 + resizeSrc?.width ?? 18 / 2,
				resizeSrc?.y ?? 2 + resizeSrc?.height ?? 368 / 2,
			)
			await page.mouse.down()
			await page.mouse.move(
				resizeDst?.x + resizeDst?.width / 2,
				resizeDst?.y + resizeDst?.height / 2,
			)
			expect(mapContainerBounding?.height).toBeGreaterThan(300)
		} else {
			throw new Error('Resize Button Element does not exist')
		}
	}
})
