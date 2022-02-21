import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test('Map with all asset locations should be visible', async ({ page }) => {
	await page.goto('http://localhost:8080/')
	await page.click('header nav a.nav-link:has-text("Map")')
	const mapMarker = page.locator(
		'#all-assets-map .leaflet-marker-icon:last-of-type',
	)

	// Map marker should be visible
	await expect(mapMarker).toBeVisible()
	await page.screenshot({
		path: `./test-session/all-assets-map-marker.png`,
	})
})
