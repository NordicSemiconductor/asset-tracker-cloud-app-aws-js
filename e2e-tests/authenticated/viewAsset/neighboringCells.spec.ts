import { expect, test } from '@playwright/test'
import * as path from 'path'
import { ncellmeasReport } from '../../asset-reported-state.js'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Neighboring cells', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Neighboring cells")')
	await expect(
		page.locator('#neighboring-cells li:first-child dd[data-test="rsrp"]'),
	).toHaveText(ncellmeasReport.nmr[0].rsrp.toString())
	await expect(
		page.locator('#neighboring-cells li:first-child dd[data-test="rsrq"]'),
	).toHaveText(ncellmeasReport.nmr[0].rsrq.toString())
	await expect(
		page.locator('#neighboring-cells li:first-child dd[data-test="earfcn"]'),
	).toHaveText(ncellmeasReport.nmr[0].earfcn.toString())
	await expect(
		page.locator('#neighboring-cells li:first-child dd[data-test="cell"]'),
	).toHaveText(ncellmeasReport.nmr[0].cell.toString())
	await expect(
		page.locator('#neighboring-cells li:last-child dd[data-test="rsrp"]'),
	).toHaveText(ncellmeasReport.nmr[1].rsrp.toString())
	await expect(
		page.locator('#neighboring-cells li:last-child dd[data-test="rsrq"]'),
	).toHaveText(ncellmeasReport.nmr[1].rsrq.toString())
	await expect(
		page.locator('#neighboring-cells li:last-child dd[data-test="earfcn"]'),
	).toHaveText(ncellmeasReport.nmr[1].earfcn.toString())
	await expect(
		page.locator('#neighboring-cells li:last-child dd[data-test="cell"]'),
	).toHaveText(ncellmeasReport.nmr[1].cell.toString())
	await page.screenshot({
		path: `./test-session/neighboring-cells.png`,
	})
})
