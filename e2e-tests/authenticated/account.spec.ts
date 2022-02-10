import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../lib/checkForConsoleErrors.js'
import { loadSessionData } from '../lib/loadSessionData.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.beforeEach(checkForConsoleErrors)

test('Users can view their account', async ({ page }) => {
	await page.goto('http://localhost:8080/')
	await page.click('text=Account')
	await expect(page.locator('div#root main')).toContainText('Account')
	const { email } = await loadSessionData('user')
	await expect(page.locator('div#root main')).toContainText(email)
})
