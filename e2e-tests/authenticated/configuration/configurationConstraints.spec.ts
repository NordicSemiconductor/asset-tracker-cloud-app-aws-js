import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { expect, test } from '@playwright/test'
import * as path from 'path'
import { checkForConsoleErrors } from '../../lib/checkForConsoleErrors.js'
import { ensureCollapsableIsOpen } from '../../lib/ensureCollapsableIsOpen.js'
import { fillWithRandomNumber } from '../../lib/fillWithRandomNumber.js'
import { loadSessionData } from '../../lib/loadSessionData.js'
import { verifyShadow } from '../../lib/verifyShadow.js'
import { AssetType, selectCurrentAsset } from '../lib.js'

const { mqttEndpoint } = fromEnv({
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
})(process.env)

const iotDataPlaneClient = new IoTDataPlaneClient({
	endpoint: `https://${mqttEndpoint}`,
})

test.use({
	storageState: path.join(process.cwd(), 'test-session', 'authenticated.json'),
})

test.afterEach(checkForConsoleErrors)

test.beforeEach(selectCurrentAsset())

test("'Movement resolution' must be higher than 'Accelerometer Inactivity Timeout' in order to submit configuration", async ({
	page,
}) => {
	await ensureCollapsableIsOpen(page)('asset:configuration')

	// Set `Movement Resolution` to lower value
	await page.fill('#mvres', '10')
	await page.fill('#accito', '11')

	// expect 'update' button to be disable
	await expect(
		page.locator('#asset-configuration-form >> footer >> button'),
	).toBeDisabled()

	// expect error messages
	await expect(page.locator('#asset-configuration-form')).toContainText(
		`Value must be higher than accelerometer inactivity timeout value: 11`,
	)
	await expect(page.locator('#asset-configuration-form')).toContainText(
		`Value must be lower than Movement Resolution value: 10`,
	)

	// Set `Accelerometer Inactivity Threshold` and `Movement Resolution` to new values
	const updatedAccelInactivityThrsh = await fillWithRandomNumber(
		page,
		'#accito',
	)
	const updatedMoveRes = Math.round(updatedAccelInactivityThrsh) + 10
	await page.fill('#mvres', updatedMoveRes.toString())

	// expect error messages dissapear
	await expect(page.locator('#asset-configuration-form')).not.toContainText(
		`Value must be higher than accelerometer inactivity timeout value`,
	)
	await expect(page.locator('#asset-configuration-form')).not.toContainText(
		`Value must be lower than Movement Resolution value`,
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
	await verifyShadow(thingName, iotDataPlaneClient, (shadow) => {
		expect(shadow.state.desired.cfg.accito).toEqual(updatedAccelInactivityThrsh)
		expect(shadow.state.desired.cfg.mvres).toEqual(updatedMoveRes)
	})
})

test("'Accelerometer Activity Threshold' must be higher than 'Accelerometer Inactivity Threshold' in order to submit configuration", async ({
	page,
}) => {
	await ensureCollapsableIsOpen(page)('asset:configuration')

	// Set `Accelerometer Activity Threshold` to lower value
	await page.fill('#accath', '10')
	await page.fill('#accith', '11')

	// expect 'update' button to be disable
	await expect(
		page.locator('#asset-configuration-form >> footer >> button'),
	).toBeDisabled()

	// expect error messages
	await expect(page.locator('#asset-configuration-form')).toContainText(
		`Value must be higher than Accelerometer Inactivity Threshold value: 11`,
	)
	await expect(page.locator('#asset-configuration-form')).toContainText(
		`Value must be lower than Accelerometer Activity Threshold value: 10`,
	)

	// Set `Accelerometer Activity Threshold` and `Accelerometer Inactivity Threshold` to new values
	const updatedAccInactivityThrsh = await fillWithRandomNumber(page, '#accith')
	const updatedAccActivityThrsh = updatedAccInactivityThrsh + 10
	await page.fill('#accath', updatedAccActivityThrsh.toString())

	// expect error messages dissapear
	await expect(page.locator('#asset-configuration-form')).not.toContainText(
		`Value must be higher than Accelerometer Inactivity Threshold value`,
	)
	await expect(page.locator('#asset-configuration-form')).not.toContainText(
		`Value must be lower than Accelerometer Activity Threshold value`,
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
	await verifyShadow(thingName, iotDataPlaneClient, (shadow) => {
		expect(shadow.state.desired.cfg.accith).toEqual(updatedAccInactivityThrsh)
		expect(shadow.state.desired.cfg.accath).toEqual(updatedAccActivityThrsh)
	})
})
