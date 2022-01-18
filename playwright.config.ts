import { devices, PlaywrightTestConfig } from '@playwright/test'

const isCI = process.env.CI !== undefined

const config: PlaywrightTestConfig = {
	testDir: './playwright',
	forbidOnly: isCI,
	retries: isCI ? 2 : 0,
	use: {
		trace: 'on-first-retry',
		video: 'on-first-retry',
	},
	projects: [
		{
			name: 'firefox',
			use: { ...devices['Desktop Firefox'] },
		},
	],
}
export default config
