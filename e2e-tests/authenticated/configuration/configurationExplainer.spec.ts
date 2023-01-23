import type { Page } from '@playwright/test'
import { expect, test } from '@playwright/test'
import * as path from 'path'
import { explainDuration } from '../../../src/components/Asset/Configuration/explainDuration.js'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { ensureCollapsableIsOpen } from '../../lib/ensureCollapsableIsOpen.js'
import { selectCurrentAsset } from '../lib.js'

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

/**
 * Check the "movement resolution" explanation sentence
 */
const checkMvresExplainerSentence = async (page: Page, value: string) =>
	expectTestSelectorToContain(
		page,
		'[data-test="configuration-explainer"] >> [data-test="mvres"]',
		`When in motion the tracker will send an update to the cloud every ${value}`,
	)

/**
 * Check the "Accelerometer Inactivity Timeout" explanation sentence
 */
const checkAccitoExplainerSentence = async (page: Page, value: string) =>
	expectTestSelectorToContain(
		page,
		'[data-test="configuration-explainer"] >> [data-test="accito"]',
		`When motion stops for more than ${value}, an update will be sent to the cloud.`,
	)

/**
 * Check the "movement timeout" explanation sentence
 */
const checkMvtExplainerSentence = async (page: Page, value: string) =>
	expectTestSelectorToContain(
		page,
		'[data-test="configuration-explainer"] >> [data-test="mvt"]',
		`If not in motion an update will be sent to the cloud every ${value}`,
	)

test('Should update the explainer configuration text in order of the field changes', async ({
	page,
}) => {
	await ensureCollapsableIsOpen(page)('asset:configuration')
	await ensureCollapsableIsOpen(page)('asset:configuration-explainer')
	await ensureCollapsableIsOpen(page)('asset:presets')

	const mvresValue = parseInt(await page.locator('#mvres').inputValue(), 10)
	const accitoValue = parseFloat(await page.locator('#accito').inputValue())
	const mvtValue = parseInt(await page.locator('#mvt').inputValue(), 10)

	// Ensure that we have proper values
	expect(mvresValue).toBeGreaterThan(1)
	expect(accitoValue).toBeGreaterThan(1)
	expect(mvtValue).toBeGreaterThan(1)

	// check config explainer with default values
	await checkMvresExplainerSentence(page, explainDuration(mvresValue))
	await checkAccitoExplainerSentence(page, explainDuration(accitoValue))
	await checkMvtExplainerSentence(page, explainDuration(mvtValue))

	await ensureCollapsableIsOpen(page)('asset:presets')

	// select Walking preset
	await page
		.locator('[id="asset:presets"] >> [data-test="walking"] >> button')
		.click()

	// check config explainer with "Walking" preset config values
	await checkMvresExplainerSentence(page, explainDuration(180))
	await checkAccitoExplainerSentence(page, explainDuration(60))
	await checkMvtExplainerSentence(page, explainDuration(3600))

	// select Parcel preset
	await page
		.locator('[id="asset:presets"] >> [data-test="parcel"] >> button')
		.click()

	// check config explainer with "Parcel" preset config values
	await checkMvresExplainerSentence(page, explainDuration(30))
	await checkAccitoExplainerSentence(page, explainDuration(10))
	await checkMvtExplainerSentence(page, explainDuration(86400))

	// select Driving preset
	await page
		.locator('[id="asset:presets"] >> [data-test="driving"] >> button')
		.click()

	// check config explainer with "Driving" preset config values
	await checkMvresExplainerSentence(page, explainDuration(60))
	await checkAccitoExplainerSentence(page, explainDuration(30))
	await checkMvtExplainerSentence(page, explainDuration(3600))

	// fill form with other info
	await page.fill('#mvres', (1000).toString())
	await page.fill('#accito', (120).toString())
	await page.fill('#mvt', (450).toString())

	// check config explainer with other config values
	await checkMvresExplainerSentence(page, explainDuration(1000))
	await checkAccitoExplainerSentence(page, explainDuration(120))
	await checkMvtExplainerSentence(page, explainDuration(450))
})
