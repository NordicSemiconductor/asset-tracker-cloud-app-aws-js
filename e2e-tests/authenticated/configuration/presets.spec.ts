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
import { ensureCollapsableIsOpen } from '../../lib/ensureCollapsableIsOpen.js'
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

test("should change preset values for 'Parcel tracking' configuration", async ({
	page,
}) => {
	await ensureCollapsableIsOpen(page)('asset:configuration')
	await ensureCollapsableIsOpen(page)('asset:presets')

	await page
		.locator('[id="asset:presets"] >> [data-test="parcel"] >> button')
		.click()

	await page.click('#asset-configuration-form >> footer >> button')

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

test("should change preset values for 'walking' configuration", async ({
	page,
}) => {
	await ensureCollapsableIsOpen(page)('asset:configuration')
	await ensureCollapsableIsOpen(page)('asset:presets')

	await page
		.locator('[id="asset:presets"] >> [data-test="walking"] >> button')
		.click()

	await page.click('#asset-configuration-form >> footer >> button')

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
