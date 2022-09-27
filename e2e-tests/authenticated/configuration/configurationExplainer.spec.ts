import { expect, Page, test } from '@playwright/test'
import { formatDuration, intervalToDuration } from 'date-fns'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { selectCurrentAsset } from '../lib.js'

// Copy from src/components/Asset/Configuration/explainDuration.ts
// TODO: re-use code from application
export const explainDuration = (value: number): string => {
	if (isNaN(value)) return '... click here to fill input'
	return `${formatDuration(
		intervalToDuration({ start: 0, end: value * 1000 }),
	)} (${value} seconds)`
}

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

const expectTestSelectorToContain = async (
	page: Page,
	selector: string,
	expected: string,
) => expect(page.locator(selector)).toContainText(expected)

// Check the "movement resolution" explanation sentence
const checkMvresExplainerSentence = async (page: Page, value: string) =>
	expectTestSelectorToContain(
		page,
		'[data-test="configuration-explainer"] >> [data-test="mvres"]',
		`When in motion the tracker will send an update to the cloud every ${value}`,
	)

// Check the "Accelerometer Inactivity Timeout" explanation sentence
const checkAccitoExplainerSentence = async (page: Page, value: string) =>
	expectTestSelectorToContain(
		page,
		'[data-test="configuration-explainer"] >> [data-test="accito"]',
		`When motion stops for more than ${value}, an update will be sent to the cloud.`,
	)

// Check the "movement timeout" explanation sentence
const checkMvtExplainerSentence = async (page: Page, value: string) =>
	expectTestSelectorToContain(
		page,
		'[data-test="configuration-explainer"] >> [data-test="mvt"]',
		`If not in motion an update will be sent to the cloud every ${value}`,
	)

test('Should update the explainer configuration text in order of the field changes', async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Configuration")')

	// open Collapsable component
	await page
		.locator('header[role="button"]:has-text("Configuration Explainer")')
		.click()

	const mvresValue = parseInt(await page.locator('#mvres').inputValue(), 10)
	const accitoValue = parseInt(await page.locator('#accito').inputValue(), 10)
	const mvtValue = parseInt(await page.locator('#mvt').inputValue(), 10)

	// Ensure that we have proper values
	expect(mvresValue).toBeGreaterThan(1)
	expect(accitoValue).toBeGreaterThan(1)
	expect(mvtValue).toBeGreaterThan(1)

	// check config explainer with default values
	await checkMvresExplainerSentence(page, explainDuration(mvresValue))
	await checkAccitoExplainerSentence(page, explainDuration(accitoValue))
	await checkMvtExplainerSentence(page, explainDuration(mvtValue))

	// Open collapsible with presets
	await page
		.locator('[data-test="presets-collapsible"] header[role="button"]')
		.click()
	// select Walking preset
	await page.locator('[data-test="walking-preset-config"]').click()

	// check config explainer with "Walking" preset config values
	await checkMvresExplainerSentence(page, explainDuration(300))
	await checkAccitoExplainerSentence(page, explainDuration(60))
	await checkMvtExplainerSentence(page, explainDuration(3600))

	// 'Presets' collapsible is already open
	// select Parcel preset
	await page.locator('[data-test="parcel-preset-config"]').click()

	// check config explainer with "Parcel" preset config values
	await checkMvresExplainerSentence(page, explainDuration(3600))
	await checkAccitoExplainerSentence(page, explainDuration(1200))
	await checkMvtExplainerSentence(page, explainDuration(21600))

	// fill form with other info
	await page.fill('#mvres', (1000).toString())
	await page.fill('#accito', (120).toString())
	await page.fill('#mvt', (450).toString())

	// check config explainer with other config values
	await checkMvresExplainerSentence(page, explainDuration(1000))
	await checkAccitoExplainerSentence(page, explainDuration(120))
	await checkMvtExplainerSentence(page, explainDuration(450))
})
