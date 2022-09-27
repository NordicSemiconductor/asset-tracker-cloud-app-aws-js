import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { expect, test } from '@playwright/test'
import * as path from 'path'
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

test("'Movement resolution' must be higher than 'Accelerometer Inactivity Timeout' in order to submit configuration", async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Configuration")')

	const mvres = 1 // 'Movement resolution' lower than default 'Accelerometer Inactivity Timeout' value
	await page.fill('#mvres', mvres.toString())

	// expect 'update' button to be disable
	await expect(
		page.locator('#asset-configuration-form >> footer >> button'),
	).toBeDisabled()

	// expect error messages
	const accitoValue = await page.locator('#accito').inputValue()
	await expect(page.locator('#asset-configuration-form')).toContainText(
		`Value must be higher than accelerometer inactivity timeout value: ${accitoValue}`,
		// Value must be higher than accelerometer inactivity timeout value: 1.7
	)
	await expect(page.locator('#asset-configuration-form')).toContainText(
		`Value must be lower than Movement Resolution value: ${mvres}`,
	)

	// update mvres
	const updatedMvres = parseInt(accitoValue, 10) + 100 // Movement resolution
	await page.fill('#mvres', updatedMvres.toString())

	// expect error messages dissapear
	await expect(page.locator('#asset-configuration-form')).not.toContainText(
		`Value must be higher than accelerometer inactivity timeout value: ${await page
			.locator('#accito')
			.inputValue()}`,
	)
	await expect(page.locator('#asset-configuration-form')).not.toContainText(
		`Value must be lower than Movement Resolution value: ${updatedMvres}`,
	)

	// expect 'update' button to be enable
	await expect(
		page.locator('#asset-configuration-form >> footer >> button'),
	).not.toBeDisabled()

	await page.click('#asset-configuration-form >> footer >> button')

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

	expect(shadow.state.desired.cfg.mvres).toEqual(updatedMvres)
})

test("'Accelerometer Activity Threshold' must be higher than 'Accelerometer Inactivity Threshold' in order to submit configuration", async ({
	page,
}) => {
	await page.click('header[role="button"]:has-text("Configuration")')

	const accith = parseInt(await page.locator('#accith').inputValue(), 10)
	const accath = accith - 1 // Accelerometer Activity Threshold lower than "Accelerometer Inactivity Threshold" default value
	await page.fill('#accath', accath.toString())

	// expect 'update' button to be disable
	await expect(
		page.locator('#asset-configuration-form >> footer >> button'),
	).toBeDisabled()

	// expect error messages
	await expect(page.locator('#asset-configuration-form')).toContainText(
		`Value must be higher than Accelerometer Inactivity Threshold value: ${await page
			.locator('#accith')
			.inputValue()}`,
	)
	await expect(page.locator('#asset-configuration-form')).toContainText(
		`Value must be lower than Accelerometer Activity Threshold value: ${accath}`,
	)

	// update accath
	const updatedAccath = accith + 1
	await page.fill('#accath', updatedAccath.toString())

	// expect error messages dissapear
	await expect(page.locator('#asset-configuration-form')).not.toContainText(
		`Value must be higher than Accelerometer Inactivity Threshold value: ${await page
			.locator('#accith')
			.inputValue()}`,
	)
	await expect(page.locator('#asset-configuration-form')).not.toContainText(
		`Value must be lower than Accelerometer Activity Threshold value: ${updatedAccath}`,
	)

	// expect 'update' button to be enable
	await expect(
		page.locator('#asset-configuration-form >> footer >> button'),
	).not.toBeDisabled()

	await page.click('#asset-configuration-form >> footer >> button')

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

	expect(shadow.state.desired.cfg.accath).toEqual(updatedAccath)
})
