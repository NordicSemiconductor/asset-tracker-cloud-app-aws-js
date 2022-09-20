import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { expect, test } from '@playwright/test'
import * as path from 'path'
import { presetConfigs } from '../../../src/asset/config.js'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { loadSessionData } from '../../lib/loadSessionData.js'
import { AssetType, selectCurrentAsset } from '../lib.js'

const { mqttEndpoint } = fromEnv({
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
})(process.env)

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test("should charge preset values for 'Parcel' configuration", async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Settings")')

	// select preset config
	await page.locator('text=Parcel Config').click()
	await page.locator('[data-test="parcel-preset-config"]').click()

	// TODO: check input fields to be updated
	//await expect(page.locator('#mvres')).toHaveValue(`${defaultConfig.mvres}`)

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

	expect(shadow.state.desired.cfg).toMatchObject(presetConfigs.parcel.config)
})

test("should charge preset values for 'walking' configuration", async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Settings")')

	// select preset config
	await page.locator('text=Walking Config').click()
	await page.locator('[data-test="walking-preset-config"]').click()

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

	expect(shadow.state.desired.cfg).toMatchObject(presetConfigs.walking.config)
})