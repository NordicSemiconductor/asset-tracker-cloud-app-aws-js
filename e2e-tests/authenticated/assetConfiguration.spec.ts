import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { expect, test } from '@playwright/test'
import * as path from 'path'
import { DataModules } from '../../src/asset/asset.js'
import { checkForConsoleErrors } from '../lib/checkForConsoleErrors.js'
import { loadSessionData } from '../lib/loadSessionData.js'
import { selectCurrentAsset } from './lib.js'

const { mqttEndpoint } = fromEnv({
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
})(process.env)

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset)

test('Change asset name', async ({ page }) => {
	await page.click('header[role="button"]:has-text("Settings")')
	const { name } = await loadSessionData('asset')
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
	const mvres = randInt(0, 3600)
	const mvt = randInt(0, 3600)
	const actwt = randInt(0, 3600)
	const acct = randFloat(0.5, 10)

	await page.click('#active-mode')
	await page.fill('#gnsst', gnsst.toString())
	await page.fill('#mvres', mvres.toString())
	await page.fill('#mvt', mvt.toString())
	await page.fill('#acct', acct.toString())
	await page.fill('#actwt', actwt.toString())
	await page.click('#gnss-disable')
	await page.click('#ncellmeas-disable')
	await page.click('#asset-settings-form >> footer >> button')
	await page.screenshot({
		path: `./test-session/asset-settings.png`,
	})

	// Verify
	const { thingName } = await loadSessionData('asset')
	const { payload } = await new IoTDataPlaneClient({
		endpoint: `https://${mqttEndpoint}`,
	}).send(
		new GetThingShadowCommand({
			thingName,
		}),
	)
	expect(payload).not.toBeUndefined()
	const shadow = JSON.parse(toUtf8(payload as Uint8Array))
	expect(shadow.state.desired.cfg).toEqual({
		act: true,
		actwt,
		mvres,
		mvt,
		gnsst,
		acct,
		nod: [DataModules.GNSS, DataModules.NeigboringCellMeasurements],
	})
})
