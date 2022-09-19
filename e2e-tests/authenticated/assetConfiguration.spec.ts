import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { expect, test } from '@playwright/test'
import * as path from 'path'
import { DataModules } from '../../src/asset/asset.js'
import { presetConfigs } from '../../src/asset/config.js'
import { checkForConsoleErrors } from '../lib/checkForConsoleErrors.js'
import { loadSessionData } from '../lib/loadSessionData.js'
import { AssetType, selectCurrentAsset } from './lib.js'

const { mqttEndpoint } = fromEnv({
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
})(process.env)

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test('Change asset name', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Settings")')
	const { name } = await loadSessionData(AssetType.Default)
	await page.fill('input[id="asset-name"]', `${name}-renamed`)
	await page.click('form[id="personalization-form"] button:has-text("Update")')
	await page.screenshot({
		path: `./test-session/asset-rename.png`,
	})
	await expect(page.locator('.navbar-brand')).toContainText(`${name}-renamed`)
})

test('Configuration note should exist', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Settings")')
	const note = page.locator('#asset-configuration-help-note')
	await expect(note).toBeVisible()
	await page.click('#asset-configuration-help-note button[aria-label="Close"]')
	await expect(note).not.toBeVisible()
})

const randFloat = (min: number, max: number) =>
	min + (max - min) * Math.random()

const randInt = (min: number, max: number) => Math.floor(randFloat(min, max))

test('Update asset configuration', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Settings")')

	const gnsst = randInt(0, 3600)
	const mvt = randInt(0, 3600)
	const mvres = 300
	// Accelerometer inactivity timeout in s: Hysteresis timeout for stillness detection.
	const accito = 1.7
	const actwt = randInt(0, 3600)
	// Accelerometer Activity Threshold in m/s²: Minimal absolute value for an accelerometer reading to be considered movement.
	const accath = 10.5
	// Accelerometer inactivity threshold in m/s²: Maximum absolute value for an accelerometer reading to be considered stillness. Should be lower than the activity threshold.
	const accith = 5

	await page.click('#active-mode')
	await page.fill('#gnsst', gnsst.toString())
	await page.fill('#mvres', mvres.toString())
	await page.fill('#mvt', mvt.toString())
	await page.fill('#accath', accath.toString())
	await page.fill('#accith', accith.toString())
	await page.fill('#accito', accito.toString())
	await page.fill('#actwt', actwt.toString())
	await page.click('#gnss-disable')
	await page.click('#ncellmeas-disable')
	await page.click('#asset-settings-form >> footer >> button')
	await page.screenshot({
		path: `./test-session/asset-settings.png`,
	})

	// Verify
	const { thingName } = await loadSessionData(AssetType.Default)
	const { payload } = await new IoTDataPlaneClient({
		endpoint: `https://${mqttEndpoint}`,
	}).send(
		new GetThingShadowCommand({
			thingName,
		}),
	)
	expect(payload).not.toBeUndefined()
	const shadow = JSON.parse(toUtf8(payload as Uint8Array))

	expect(shadow.state.desired.cfg).toMatchObject({
		act: true,
		actwt,
		mvres,
		mvt,
		gnsst,
		accath,
		accith,
		accito,
		nod: [DataModules.GNSS, DataModules.NeigboringCellMeasurements],
	})
})

test("Should check 'update' button to be disabled when form is fill with null values", async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Settings")')

	// expect 'update' button to be disable be default
	await expect(
		page.locator('#asset-settings-form >> footer >> button'),
	).toBeDisabled()

	// update Active Wait Time with value
	await page.fill('#actwt', (400).toString())

	// expect 'update' button to be enable
	await expect(
		page.locator('#asset-settings-form >> footer >> button'),
	).not.toBeDisabled()

	// update Active Wait Time with wrong value
	await page.fill('#actwt', '')

	// expect update button to be disabled
	await expect(
		page.locator('#asset-settings-form >> footer >> button'),
	).toBeDisabled()

	// update Active Wait Time with correct value
	await page.fill('#actwt', (400).toString())

	// expect update to be enable
	await expect(
		page.locator('#asset-settings-form >> footer >> button'),
	).not.toBeDisabled()
})

test("should charge preset values for 'Parcel' configuration", async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Settings")')

	// select preset config
	await page.locator('text=Parcel Config').click()

	// TODO: check input fields to be updated

	// update config
	await page.click('#asset-settings-form >> footer >> button')

	// Verify
	const { thingName } = await loadSessionData(AssetType.Default)
	const { payload } = await new IoTDataPlaneClient({
		endpoint: `https://${mqttEndpoint}`,
	}).send(
		new GetThingShadowCommand({
			thingName,
		}),
	)
	expect(payload).not.toBeUndefined()
	const shadow = JSON.parse(toUtf8(payload as Uint8Array))

	// TODO: use presetConfigs as object to match
	expect(shadow.state.desired.cfg).toMatchObject(presetConfigs.parcel.config)
})

test("should charge preset values for 'walking' configuration", async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Settings")')

	// select preset config
	await page.locator('text=Walking Config').click()

	// TODO: check input fields to be updated

	// update config
	await page.click('#asset-settings-form >> footer >> button')

	// Verify
	const { thingName } = await loadSessionData(AssetType.Default)
	const { payload } = await new IoTDataPlaneClient({
		endpoint: `https://${mqttEndpoint}`,
	}).send(
		new GetThingShadowCommand({
			thingName,
		}),
	)
	expect(payload).not.toBeUndefined()
	const shadow = JSON.parse(toUtf8(payload as Uint8Array))

	// TODO: use presetConfigs as object to match
	expect(shadow.state.desired.cfg).toMatchObject(presetConfigs.walking.config)
})
