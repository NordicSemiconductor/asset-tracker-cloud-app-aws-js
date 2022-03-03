import { Page } from '@playwright/test'

export const updateSettings =
	(page: Page) =>
	async ({
		gnssHistory,
		singleCell,
		singleCellHistory,
		neighboringCell,
		neighboringCellHistory,
		follow,
	}: {
		gnssHistory?: boolean
		singleCell?: boolean
		singleCellHistory?: boolean
		neighboringCell?: boolean
		neighboringCellHistory?: boolean
		follow?: boolean
	}): Promise<void> => {
		await page.click('button[data-test="show-map-settings"]')
		if (gnssHistory !== undefined) {
			if (gnssHistory) {
				await page.locator('#mapSettingsFetchGNSSHistory').check()
			} else {
				await page.locator('#mapSettingsFetchGNSSHistory').uncheck()
			}
		}
		if (singleCell !== undefined) {
			if (singleCell) {
				await page.locator('#mapSettingsSingleCellGeoLocations').check()
			} else {
				await page.locator('#mapSettingsSingleCellGeoLocations').uncheck()
			}
		}
		if (singleCellHistory !== undefined) {
			if (singleCellHistory) {
				await page.locator('#mapSettingsFetchSingleCellHistory').check()
			} else {
				await page.locator('#mapSettingsFetchSingleCellHistory').uncheck()
			}
		}
		if (neighboringCell !== undefined) {
			if (neighboringCell) {
				await page.locator('#mapSettingsNeighboringCellGeoLocations').check()
			} else {
				await page.locator('#mapSettingsNeighboringCellGeoLocations').uncheck()
			}
		}
		if (neighboringCellHistory !== undefined) {
			if (neighboringCellHistory) {
				await page.locator('#mapSettingsFetchNeighboringCellHistory').check()
			} else {
				await page.locator('#mapSettingsFetchNeighboringCellHistory').uncheck()
			}
		}
		if (follow !== undefined) {
			if (follow) {
				await page.locator('input[name="mapSettingsFollow"]').check()
			} else {
				await page.locator('input[name="mapSettingsFollow"]').uncheck()
			}
		}
		await page.click('button[data-test="show-map-settings"]')
	}
