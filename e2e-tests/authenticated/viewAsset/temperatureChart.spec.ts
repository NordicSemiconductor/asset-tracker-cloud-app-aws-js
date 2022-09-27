import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { ensureCollapsableIsOpen } from '../../lib/ensureCollapsableIsOpen.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Temperature history', async ({ page }) => {
	await ensureCollapsableIsOpen(page)('asset:temperature')
	await expect(
		page.locator('.historical-data-chart.temperature-history'),
	).toBeVisible({ timeout: 30000 })
	await page.screenshot({
		fullPage: true,
		path: `./test-session/temperature-chart.png`,
	})
})
