import type { PlaywrightTestConfig } from '@playwright/test'
import { devices } from '@playwright/test'
import path from 'path'
const isCI = process.env.CI !== undefined

const config: PlaywrightTestConfig = {
	testDir: path.join(process.cwd(), 'e2e-tests'),
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	use: {
		trace: 'on-first-retry',
		video: 'on-first-retry',
		screenshot: 'only-on-failure',
	},
	projects: [
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
	],
	// Many tests operate on the Thing shadow of the same device, so we disable parallel test runs here globally
	workers: 1,
}

export default config
