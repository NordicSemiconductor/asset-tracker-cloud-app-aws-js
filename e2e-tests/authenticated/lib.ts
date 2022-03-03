import type { Page } from '@playwright/test'
import { expect } from '@playwright/test'
import { loadSessionData } from '../lib/loadSessionData.js'

export enum AssetType {
	Default = 'asset',
	NoGNSS = 'asset-no-gnss',
}

export const selectCurrentAsset =
	(asset = AssetType.Default) =>
	async ({ page }: { page: Page }): Promise<void> => {
		const { name } = await loadSessionData(asset)

		await page.goto('http://localhost:8080/')
		const assetLink = page.locator(`a:text-matches("^${name}")`)
		await assetLink.waitFor()

		while ((await assetLink.count()) === 0) {
			console.debug(`Link to asset ${name} not visible, load next page`)
			const loadMoreButton = page.locator(
				`button:not(disabled):has-text("Load more")`,
			)
			await loadMoreButton.waitFor()
			await loadMoreButton.click()
		}

		expect(await assetLink.count()).toEqual(1)
		await page.screenshot({ fullPage: true, path: `./test-session/assets.png` })

		await assetLink.click()
	}
