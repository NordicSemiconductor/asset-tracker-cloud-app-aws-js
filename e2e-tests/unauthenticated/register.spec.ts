import { expect, test } from '@playwright/test'
import Chance from 'chance'
import { promises as fs } from 'fs'
import id128 from 'id128'
import * as path from 'path'
import { confirmSignUp } from '../lib/confirmSignup.js'
const { Ulid } = id128

const chance = new Chance()

test('Register a new account', async ({ page }) => {
	const password = `U${Ulid.generate().toCanonical()}!`
	const email = chance.email({ domain: 'example.com' })

	// Open start page
	await page.goto('http://localhost:8080/')
	const { short_name } = JSON.parse(
		await fs.readFile(
			path.join(process.cwd(), 'public', 'manifest.json'),
			'utf-8',
		),
	)
	await expect(page.locator('div#root')).toContainText(short_name)
	await expect(page.locator('div#root')).toContainText('Sign In')
	await page.screenshot({ path: `./test-session/login.png` })

	// find registration link
	await page.click('text=Create Account')
	await page.screenshot({ path: `./test-session/register.png` })

	// input user information
	await page.fill('[placeholder="Email"]', email)
	await page.fill('[placeholder="Password"]', password)
	await page.fill('[placeholder="Confirm Password"]', password)
	await page.click('button:has-text("Create Account")')
	await expect(page.locator('div#root')).toContainText('We Emailed You')
	await page.screenshot({ path: `./test-session/register-confirm.png` })

	// input verification token
	await confirmSignUp(email)

	// confirm user account
	await page.goto('http://localhost:8080/')

	// log in
	await page.click('text=Sign In')
	await page.fill('[placeholder="Email"]', email)
	await page.fill('[placeholder="Password"]', password)
	await page.click('button:has-text("Sign in")')
	await page.waitForNavigation({
		url: 'http://localhost:8080/assets',
	})
	await expect(page.locator('main')).toContainText(`Assets`)

	// Store state to be re-used in authenticated tests
	await page.context().storageState({
		path: path.join(process.cwd(), 'test-session', 'authenticated.json'),
	})
	await fs.writeFile(
		path.join(process.cwd(), 'test-session', 'user.json'),
		JSON.stringify({ email }),
		'utf-8',
	)

	// sign out
	await page.click('text=Sign out')
	await expect(page.locator('div#root')).toContainText(short_name)
	await expect(page.locator('div#root')).toContainText('Sign in')
})
