import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { expect, test } from '@playwright/test'
import * as path from 'path'
import { defaultConfig } from '../../../src/asset/config.js'
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

test("'Movement resolution' must be higher than 'Accelerometer inactivity timeout' in order to submit configuration", async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Settings")')

	const mvres = 1 // 'Movement resolution' lower than default 'Accelerometer inactivity timeout' value
	await page.fill('#mvres', mvres.toString())

	// expect 'update' button to be disable
	await expect(
		page.locator('#asset-settings-form >> footer >> button'),
	).toBeDisabled()

	// expect error messages
	await expect(page.locator('#asset-settings-form')).toContainText(
		`Value must be higher than accelerometer inactivity timeout value: ${defaultConfig.accito}`,
	)
	await expect(page.locator('#asset-settings-form')).toContainText(
		`Value must be lower than Movement Resolution value: ${mvres}`,
	)

	// update mvres
	const updatedMvres = 100 // Movement resolution
	await page.fill('#mvres', updatedMvres.toString())

	// expect error messages dissapear
	await expect(page.locator('#asset-settings-form')).not.toContainText(
		`Value must be higher than accelerometer inactivity timeout value: ${defaultConfig.accito}`,
	)
	await expect(page.locator('#asset-settings-form')).not.toContainText(
		`Value must be lower than Movement Resolution value: ${updatedMvres}`,
	)

	// expect 'update' button to be enable
	await expect(
		page.locator('#asset-settings-form >> footer >> button'),
	).not.toBeDisabled()

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
		...defaultConfig,
		mvres: updatedMvres,
	})
})

test("'Accelerometer Activity Threshold' must be higher than 'Accelerometer inactivity threshold' in order to submit configuration", async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Settings")')

	const accath = 4.5 // Accelerometer Activity Threshold lower than "Accelerometer inactivity threshold" default value
	await page.fill('#accath', accath.toString())

	// expect 'update' button to be disable
	await expect(
		page.locator('#asset-settings-form >> footer >> button'),
	).toBeDisabled()

	// expect error messages
	await expect(page.locator('#asset-settings-form')).toContainText(
		`Value must be higher than Accelerometer inactivity threshold value: ${defaultConfig.accith}`,
	)
	await expect(page.locator('#asset-settings-form')).toContainText(
		`Value must be lower than Accelerometer Activity Threshold value: ${accath}`,
	)

	// update accath
	const updatedAccath = 10.5
	await page.fill('#accath', updatedAccath.toString())

	// expect error messages dissapear
	await expect(page.locator('#asset-settings-form')).not.toContainText(
		`Value must be higher than Accelerometer inactivity threshold value: ${defaultConfig.accith}`,
	)
	await expect(page.locator('#asset-settings-form')).not.toContainText(
		`Value must be lower than Accelerometer Activity Threshold value: ${updatedAccath}`,
	)

	// expect 'update' button to be enable
	await expect(
		page.locator('#asset-settings-form >> footer >> button'),
	).not.toBeDisabled()

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
		...defaultConfig,
		accath: updatedAccath,
		mvres: 100, // value updated from "'Movement resolution' must be higher than 'Accelerometer inactivity timeout' in order to submit configuration" test
	})
})
