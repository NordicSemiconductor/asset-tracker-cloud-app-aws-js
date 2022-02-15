import { expect, test } from '@playwright/test'
import { promises as fs } from 'fs'
import * as path from 'path'
import { checkForConsoleErrors } from '../lib/checkForConsoleErrors.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test('Users can delete their account', async ({ page }) => {
	await page.goto('http://localhost:8080/')
	await page.click('text=Account')
	await page.click('text=Enable to unlock account deletion')
	await page.click('text=Delete account')
	// Should sign out
	const { short_name } = JSON.parse(
		await fs.readFile(
			path.join(process.cwd(), 'public', 'manifest.json'),
			'utf-8',
		),
	)
	await expect(page.locator('div#root')).toContainText(short_name)
	await expect(page.locator('div#root')).toContainText('Sign in')
})
