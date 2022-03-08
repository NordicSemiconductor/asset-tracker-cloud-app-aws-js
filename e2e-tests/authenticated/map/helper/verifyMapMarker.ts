import { expect, Page } from '@playwright/test'
import { loadSessionData } from '../../../lib/loadSessionData.js'
import { AssetType } from '../../lib.js'

export const verifyMapMarker = async (
	page: Page,
	type = AssetType.Default,
): Promise<void> => {
	const mapMarker = page.locator('#asset-map .leaflet-marker-icon')
	const mapMarkerPopup = page.locator('#asset-map .leaflet-popup')

	// Map marker should be visible
	await expect(mapMarker).toBeVisible({ timeout: 30000 })
	await mapMarker.click()
	await expect(mapMarkerPopup).toBeVisible()
	const { name } = await loadSessionData(type)
	await expect(mapMarkerPopup).toContainText(name)
}
