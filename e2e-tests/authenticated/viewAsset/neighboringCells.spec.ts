import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { ensureCollapsableIsOpen } from '../../lib/ensureCollapsableIsOpen.js'
import { loadSessionData } from '../../lib/loadSessionData.js'
import { networkSurveys } from '../../setup/networkSurveys.js'
import { AssetType, selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Neighboring cells', async ({ page }) => {
	const { thingName } = await loadSessionData(AssetType.Default)
	const ncellmeasReport = networkSurveys({ thingName })
	await ensureCollapsableIsOpen(page)('asset:neighboringcells')
	const nmr = ncellmeasReport[0].lte?.nmr
	await expect(
		page.locator('#neighboring-cells li:first-child dd[data-test="rsrp"]'),
	).toHaveText(nmr?.[0]?.rsrp.toString() ?? '')
	await expect(
		page.locator('#neighboring-cells li:first-child dd[data-test="rsrq"]'),
	).toHaveText(nmr?.[0]?.rsrq.toString() ?? '')
	await expect(
		page.locator('#neighboring-cells li:first-child dd[data-test="earfcn"]'),
	).toHaveText(nmr?.[0]?.earfcn.toString() ?? '')
	await expect(
		page.locator('#neighboring-cells li:first-child dd[data-test="cell"]'),
	).toHaveText(nmr?.[0]?.cell.toString() ?? '')
	await expect(
		page.locator('#neighboring-cells li:last-child dd[data-test="rsrp"]'),
	).toHaveText(nmr?.[1].rsrp.toString() ?? '')
	await expect(
		page.locator('#neighboring-cells li:last-child dd[data-test="rsrq"]'),
	).toHaveText(nmr?.[1].rsrq.toString() ?? '')
	await expect(
		page.locator('#neighboring-cells li:last-child dd[data-test="earfcn"]'),
	).toHaveText(nmr?.[1].earfcn.toString() ?? '')
	await expect(
		page.locator('#neighboring-cells li:last-child dd[data-test="cell"]'),
	).toHaveText(nmr?.[1].cell.toString() ?? '')
	await page.screenshot({
		path: `./test-session/neighboring-cells.png`,
	})
})
