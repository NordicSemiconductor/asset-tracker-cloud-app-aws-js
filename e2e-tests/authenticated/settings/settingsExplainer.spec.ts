import { expect, Page, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

// Check the "movement resolution" explanation sentence
const checkMvresExplainerSentence = async (page: Page, value: string) =>
	expect(page.locator('p[data-test="mvres-config-explainer"]')).toContainText(
		`When in motion the tracker will send an update to the cloud every ${value}`,
	)

// Check the "Accelerometer inactivity timeout" explanation sentence
const checkAccitoExplainerSentence = async (page: Page, value: string) =>
	expect(page.locator('p[data-test="accito-config-explainer"]')).toContainText(
		`When motion stops for more than ${value}, an update will be sent to the cloud.`,
	)

// Check the "movement timeout" explanation sentence
const checkMvtExplainerSentence = async (page: Page, value: string) =>
	expect(page.locator('p[data-test="mvt-config-explainer"]')).toContainText(
		`If not in motion an update will be sent to the cloud every ${value}`,
	)

test('Should update the explainer configuration text in order of the field changes', async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Settings")')

	// open Collapsable component
	await page
		.locator('header[role="button"]:has-text("Configuration explainer")')
		.click()

	// check config explainer with default values
	await checkMvresExplainerSentence(page, '5 minutes (300 seconds)')
	await checkAccitoExplainerSentence(page, '1 minute (60 seconds)')
	await checkMvtExplainerSentence(page, '1 hour (3600 seconds)')

	// select "Walking" preset config
	// Open collapsible with presets
	await page
		.locator('[data-test="presets-collapsible"] header[role="button"]')
		.click()
	// select Walking preset
	await page.locator('[data-test="walking-preset-config"]').click()

	// check config explainer with "Walking" preset config values
	await checkMvresExplainerSentence(page, '5 minutes (300 seconds)')
	await checkAccitoExplainerSentence(page, '1 minute (60 seconds)')
	await checkMvtExplainerSentence(page, '1 hour (3600 seconds)')

	// 'Presets' collapsible is already open
	// select Parcel preset
	await page.locator('[data-test="parcel-preset-config"]').click()

	// check config explainer with "Parcel" preset config values
	await checkMvresExplainerSentence(page, '1 hour (3600 seconds)')
	await checkAccitoExplainerSentence(page, '20 minutes (1200 seconds)')
	await checkMvtExplainerSentence(page, '6 hours (21600 seconds)')

	// fill form with other info
	await page.fill('#mvres', (1000).toString())
	await page.fill('#accito', (120).toString())
	await page.fill('#mvt', (450).toString())

	// check config explainer with other config values
	await checkMvresExplainerSentence(
		page,
		'16 minutes 40 seconds (1000 seconds)',
	)
	await checkAccitoExplainerSentence(page, '2 minutes (120 seconds)')
	await checkMvtExplainerSentence(page, '7 minutes 30 seconds (450 seconds)')
})
