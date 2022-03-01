import { expect, test } from '@playwright/test'
import * as path from 'path'
import { state as reported } from '../../asset-reported-state.js'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Asset Information', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Asset Information")')

	// Check asset information
	for (const prop of ['imei', 'iccid', 'modV', 'brdV', 'appV']) {
		await expect(
			page.locator(`#asset-information [data-test="dev-${prop}"]`),
		).toContainText((reported as any).dev.v[prop].toString())
	}

	// Check roaming information
	for (const prop of ['nw', 'band', 'rsrp', 'mccmnc', 'area', 'cell', 'ip']) {
		await expect(
			page.locator(`#asset-information [data-test="roam-${prop}"]`),
		).toContainText((reported as any).roam.v[prop].toString())
	}

	await page.screenshot({
		fullPage: true,
		path: `./test-session/asset-info.png`,
	})
})
