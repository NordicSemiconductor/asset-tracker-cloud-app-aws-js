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

test('Button presses', async ({ page }) => {
	await ensureCollapsableIsOpen(page)('asset:button')
	await expect(page.locator('table.table.button-presses')).toBeVisible()
	expect(
		await page.locator('table.table.button-presses tbody tr').count(),
	).toEqual(24)
	await page.screenshot({
		fullPage: true,
		path: `./test-session/button-presses.png`,
	})
})
