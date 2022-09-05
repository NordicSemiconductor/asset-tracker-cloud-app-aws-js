import { expect, test } from '@playwright/test'
import * as fs from 'fs'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { loadSessionData } from '../../lib/loadSessionData.js'
import { AssetType, selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

const updateFileWithVersion = path.join(
	process.cwd(),
	'e2e-tests',
	'data',
	'asset_tracker_v2-nRF9160DK-debug-app_upgrade-v3.0.14.bin',
)

const updateFileWithoutVersion = path.join(
	process.cwd(),
	'e2e-tests',
	'data',
	'update.bin',
)

test('Create firmware update from file', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Firmware Upgrade")')
	const { thingName } = await loadSessionData(AssetType.Default)

	await page.locator('input[type="file"]').setInputFiles(updateFileWithVersion)

	// It should parse the filename and pre-fill the next version
	await expect(page.locator('input[name="nextVersion"]')).toHaveValue('3.0.14')

	// Create the job
	await page.click('button:has-text("Create upgrade job")')

	await page.screenshot({
		fullPage: true,
		path: `./test-session/fota.png`,
	})

	// It should show up in the list
	const jobHeader = page.locator(
		'div[data-test="firmware-upgrade-jobs"] div[role="button"]:has-text("3.0.14 (QUEUED)")',
	)
	await expect(jobHeader).toBeVisible({ timeout: 2 * 60 * 1000 })

	// Show details
	await jobHeader.click()

	// Verify details
	const jobInfo =
		'div[data-test="firmware-upgrade-jobs"] [data-test="firmware-upgrade-job-info"]'
	await expect(page.locator(`${jobInfo} [data-test="description"]`)).toHaveText(
		`Upgrade ${thingName} to version 3.0.14.`,
	)
	await expect(page.locator(`${jobInfo} [data-test="version"]`)).toHaveText(
		`3.0.14`,
	)
	await expect(page.locator(`${jobInfo} [data-test="firmware"]`)).toHaveText(
		`asset_tracker_v2-nRF9160DK-debug-app_upgrade-v3.0.14.bin`,
	)

	// Trigger download and wait for the download process to complete
	const [download] = await Promise.all([
		page.waitForEvent('download'),
		page.locator(`${jobInfo} [data-test="firmware"] a`).click(),
	])
	const downloadedPath = await download.path()

	// Compare sizes
	expect(fs.statSync(updateFileWithVersion).size).toEqual(
		fs.statSync(downloadedPath as string).size,
	)

	await page.screenshot({
		fullPage: true,
		path: `./test-session/fota-job.png`,
	})

	// Cancel and delete the job
	await page
		.locator('div[data-test="firmware-upgrade-jobs"] input[id=unlockCancel]')
		.check()
	await page
		.locator(
			'div[data-test="firmware-upgrade-jobs"] button:has-text("Cancel job")',
		)
		.click()
	await page.screenshot({
		fullPage: true,
		path: `./test-session/fota-cancelled.png`,
	})
	await page
		.locator('div[data-test="firmware-upgrade-jobs"] input[id=unlockDelete]')
		.check()
	await page
		.locator('div[data-test="firmware-upgrade-jobs"] button:has-text("Delete")')
		.click()
	await page.screenshot({
		fullPage: true,
		path: `./test-session/fota-deleted.png`,
	})
})

test('create firmware version from current version', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Firmware Upgrade")')
	await page
		.locator('input[type="file"]')
		.setInputFiles(updateFileWithoutVersion)
	await expect(page.locator('input[name="nextVersion"]')).toHaveValue('1.0.2')
})
