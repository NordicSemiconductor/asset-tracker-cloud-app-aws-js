import { expect, test } from '@playwright/test'
import * as path from 'path'
import { AssetType } from '../authenticated/lib.js'
import { checkForConsoleErrors } from '../lib/checkForConsoleErrors.js'
import { loadSessionData } from '../lib/loadSessionData.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test('Users can delete assets', async ({ page }) => {
	for (const type of [AssetType.Default, AssetType.NoGNSS]) {
		const { name, thingName } = await loadSessionData(type)

		await page.goto('http://localhost:8080/')
		const assetLink = page.locator(`text=${name}`)
		await assetLink.waitFor()

		while ((await assetLink.count()) === 0) {
			console.debug(`Link to asset ${name} not visible, load next page`)
			const loadMoreButton = page.locator(
				`button:not(disabled):has-text("Load more")`,
			)
			await loadMoreButton.waitFor()
			await loadMoreButton.click()
		}

		await assetLink.click()
		await page.click('header[role="button"]:has-text("Danger zone")')
		await page.click('text=Enable to unlock asset deletion')
		await page.click('text=Delete asset')

		await expect(page.locator('div#root main')).toContainText(
			`Asset ${thingName} has been deleted.`,
		)
	}
})
