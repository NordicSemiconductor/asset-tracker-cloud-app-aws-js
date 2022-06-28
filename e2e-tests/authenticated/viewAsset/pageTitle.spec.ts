import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { loadSessionData } from '../../lib/loadSessionData.js'
import { AssetType, selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Title should contain asset name', async ({ page }) => {
	const { name } = await loadSessionData(AssetType.Default)
	await expect(page.locator('.navbar-brand')).toContainText(name)
})
