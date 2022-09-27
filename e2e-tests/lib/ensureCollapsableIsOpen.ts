import { expect, Page } from '@playwright/test'

/**
 * Helper function that ensures the collapsable with the id is open.
 */
export const ensureCollapsableIsOpen =
	(page: Page) =>
	async (id: string): Promise<void> => {
		const collapsibleHeader = page.locator(`[id="${id}"] >> header`).first()

		const expanded = await collapsibleHeader.getAttribute('aria-expanded')

		if (expanded === 'false') {
			await collapsibleHeader.click()
		}

		expect(
			await collapsibleHeader.getAttribute('aria-expanded'),
			`Collapsable ${id} is not open.`,
		).toEqual('true')
	}
