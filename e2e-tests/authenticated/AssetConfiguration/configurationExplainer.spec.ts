import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Should update the explainer configuration text in order of the field changes', async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Settings")')

	// select preset config
	await page.locator('text=Walking Config').click()
	await page.locator('[data-test="walking-preset-config"]').click()

	// open Collapsable component
	await page
		.locator('header[role="button"]:has-text("Configuration explainer")')
		.click()

	// check config explainer
	await expect(
		page.locator('p[data-test="mvres-config-explainer"]'),
	).toContainText(
		'When in motion the tracker will send an update to the cloud every 5 minutes (300 seconds)',
	)
	await expect(
		page.locator('p[data-test="accito-config-explainer"]'),
	).toContainText(
		'When motion stops for more than 1 minute (60 seconds), an update will be sent to the cloud.',
	)
	await expect(
		page.locator('p[data-test="mvt-config-explainer"]'),
	).toContainText(
		'If not in motion an update will be sent to the cloud every 1 hour (3600 seconds)',
	)

	// select preset config
	await page.locator('text=Parcel Config').click()
	await page.locator('[data-test="parcel-preset-config"]').click()

	// check config explainer
	await expect(
		page.locator('p[data-test="mvres-config-explainer"]'),
	).toContainText(
		'When in motion the tracker will send an update to the cloud every 1 hour (3600 seconds)',
	)
	await expect(
		page.locator('p[data-test="accito-config-explainer"]'),
	).toContainText(
		'When motion stops for more than 20 minutes (1200 seconds), an update will be sent to the cloud.',
	)
	await expect(
		page.locator('p[data-test="mvt-config-explainer"]'),
	).toContainText(
		'If not in motion an update will be sent to the cloud every 6 hours (21600 seconds)',
	)

	// fill form with other info
	await page.fill('#mvres', (1000).toString())
	await page.fill('#accito', (120).toString())
	await page.fill('#mvt', (450).toString())

	// check config explainer
	await expect(
		page.locator('p[data-test="mvres-config-explainer"]'),
	).toContainText(
		'When in motion the tracker will send an update to the cloud every 16 minutes 40 seconds (1000 seconds)',
	)
	await expect(
		page.locator('p[data-test="accito-config-explainer"]'),
	).toContainText(
		'When motion stops for more than 2 minutes (120 seconds), an update will be sent to the cloud.',
	)
	await expect(
		page.locator('p[data-test="mvt-config-explainer"]'),
	).toContainText(
		'If not in motion an update will be sent to the cloud every 7 minutes 30 seconds (450 seconds)',
	)
})
