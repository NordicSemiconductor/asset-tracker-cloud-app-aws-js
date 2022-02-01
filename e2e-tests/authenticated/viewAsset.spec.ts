import { expect, test } from '@playwright/test'
import * as path from 'path'
import { state as reported } from '../asset-reported-state.js'
import { loadSessionData } from '../lib/loadSessionData.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.beforeEach(async ({ page }) => {
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

	expect(await assetLink.count()).toEqual(1)
	await page.screenshot({ path: `./test-session/assets.png` })

	await assetLink.click()
})

test('Title should contain asset name', async ({ page }) => {
	const { name } = await loadSessionData('asset')
	await expect(page.locator('.navbar-brand')).toContainText(name)
	await page.screenshot({ path: `./test-session/asset.png` })
})

/**
 * The problem here is that fetching device details includes the device shadow,
 * which the users assigns to themselves on log-in. I can take a few minutes for
 * the policy to take effect.
 */
test('Show details', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Asset Information")')

	// Check device information
	for (const prop of ['imei', 'iccid', 'modV', 'brdV', 'appV']) {
		await expect(
			page.locator(`#asset-information [data-test="dev-${prop}"]`),
		).toContainText(reported.dev.v[prop])
	}

	// Check roaming information
	for (const prop of ['nw', 'band', 'rsrp', 'mccmnc', 'area', 'cell', 'ip']) {
		await expect(
			page.locator(`#asset-information [data-test="roam-${prop}"]`),
		).toContainText(reported.roam.v[prop].toString())
	}

	await page.screenshot({ path: `./test-session/asset-info.png` })
})
