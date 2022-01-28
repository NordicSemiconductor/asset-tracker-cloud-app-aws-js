import { expect, test } from '@playwright/test'
import { promises as fs } from 'fs'
import * as path from 'path'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test('Users can view their account', async ({ page }) => {
	await page.goto('http://localhost:8080/')
	await page.click('text=Account')
	await expect(page.locator('div#root main')).toContainText('Account')
	const { email } = JSON.parse(
		await fs.readFile(
			path.join(process.cwd(), 'test-session', 'user.json'),
			'utf-8',
		),
	)
	await expect(page.locator('div#root main')).toContainText(email)
})
