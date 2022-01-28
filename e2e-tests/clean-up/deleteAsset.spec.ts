import { test } from '@playwright/test'
import * as path from 'path'
import { loadSessionData } from '../lib/loadSessionData.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test('Users can delete assets', async ({ page }) => {
	const { name } = await loadSessionData('asset')

	await page.goto('http://localhost:8080/')
	const assetLink = page.locator(`text=${name}`)
	await assetLink.waitFor()

	while ((await assetLink.count()) === 0) {
		console.debug(`Link to device ${name} not visible, load next page`)
		const loadMoreButton = page.locator(
			`button:not(disabled):has-text("Load more")`,
		)
		await loadMoreButton.waitFor()
		await loadMoreButton.click()
	}

	await assetLink.click()
	await page.click('text=Enable to unlock asset deletion')
	await page.click('text=Delete asset')
})
