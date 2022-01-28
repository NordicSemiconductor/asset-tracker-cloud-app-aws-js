import { expect, test } from '@playwright/test'
import * as path from 'path'
import { loadSessionData } from '../lib/loadSessionData.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test('Select asset', async ({ page }) => {
	const { name, thingName } = await loadSessionData('asset')

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

	expect(await assetLink.count()).toEqual(1)
	await page.screenshot({ path: `./test-session/assets.png` })

	await assetLink.click()
	await expect(page.locator('div#root main')).toContainText('Asset ID')
	await expect(page.locator('div#root main')).toContainText(thingName)
	await page.screenshot({ path: `./test-session/asset.png` })
})
