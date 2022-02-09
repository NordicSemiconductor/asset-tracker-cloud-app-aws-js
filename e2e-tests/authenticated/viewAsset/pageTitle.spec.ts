import { expect, test } from '@playwright/test'
import * as path from 'path'
import { loadSessionData } from '../../lib/loadSessionData.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.beforeEach(selectCurrentAsset)

test('Title should contain asset name', async ({ page }) => {
	const { name } = await loadSessionData('asset')
	await expect(page.locator('.navbar-brand')).toContainText(name)
})
