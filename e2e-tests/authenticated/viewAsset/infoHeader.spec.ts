import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Info header should show asset information', async ({ page }) => {
	// Connection info
	const connInfoLocator = page.locator(
		`#info-header [data-test="connection-info"]`,
	)
	await expect(connInfoLocator).toContainText('-97 dBm')
	await expect(connInfoLocator).toContainText('Telenor')
	await expect(connInfoLocator).toContainText('LTE-M')
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
