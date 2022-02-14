import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.beforeEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Button presses', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Button")')
	await expect(page.locator('table.table.button-presses')).toBeVisible()
	expect(
		await page.locator('table.table.button-presses tbody tr').count(),
	).toEqual(24)
	await page.screenshot({
		fullPage: true,
		path: `./test-session/button-presses.png`,
	})
})
