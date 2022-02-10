import { expect, test } from '@playwright/test'
import { promises as fs } from 'fs'
import * as path from 'path'
import { checkForConsoleErrors } from '../lib/checkForConsoleErrors'

test.beforeEach(checkForConsoleErrors)

test('Users can sign out', async ({ page }) => {
	await page.goto('http://localhost:8080/')
	await expect(page.locator('main')).toContainText(`Assets`)

	// sign out
	await page.click('text=Sign out')
	const { short_name } = JSON.parse(
		await fs.readFile(
			path.join(process.cwd(), 'public', 'manifest.json'),
			'utf-8',
		),
	)
	await expect(page.locator('div#root')).toContainText(short_name)
	await expect(page.locator('div#root')).toContainText('Sign in')
})
