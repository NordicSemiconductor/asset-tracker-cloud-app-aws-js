import { expect, test } from '@playwright/test'
import * as path from 'path'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test('List assets', async ({ page }) => {
	await page.goto('http://localhost:8080/')
	await page.waitForSelector('[data-test-id=assets-list] a')
	const assetsLinksCount = await page
		.locator('[data-test-id=assets-list] a')
		.count()
	expect(assetsLinksCount).toBeGreaterThan(1)
	await page.screenshot({ path: `./test-session/assets.png` })
})
