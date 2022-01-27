import {
	AdminConfirmSignUpCommand,
	AdminUpdateUserAttributesCommand,
	CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { expect, test } from '@playwright/test'
import Chance from 'chance'
import fs from 'fs'
import id128 from 'id128'
import path from 'path'
const { Ulid } = id128

const chance = new Chance()
const { short_name } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'public', 'manifest.json'), 'utf-8'),
)

const { UserPoolId } = fromEnv({
	UserPoolId: 'PUBLIC_USER_POOL_ID',
})(process.env)

const confirmSignUp = async (email: string): Promise<void> => {
	const upc = new CognitoIdentityProviderClient({})
	await Promise.all([
		upc.send(
			new AdminConfirmSignUpCommand({
				UserPoolId,
				Username: email,
			}),
		),
		upc.send(
			new AdminUpdateUserAttributesCommand({
				UserPoolId,
				Username: email,
				UserAttributes: [{ Name: 'email_verified', Value: 'true' }],
			}),
		),
	])
	console.debug(`Confirmed ${email}.`)
}

test('Register a new account', async ({ page }) => {
	const password = `U${Ulid.generate().toCanonical()}!`
	const email = chance.email({ domain: 'example.com' })

	// Open start page
	await page.goto('http://localhost:8080/')
	await expect(page.locator('div#root')).toContainText(short_name)
	await expect(page.locator('div#root')).toContainText('Sign In')
	await page.screenshot({ path: `./test-results/login.png` })

	// find registration link
	await page.click('text=Create Account')
	await page.screenshot({ path: `./test-results/register.png` })

	// input user information
	await page.fill('[placeholder="Email"]', email)
	await page.fill('[placeholder="Password"]', password)
	await page.fill('[placeholder="Confirm Password"]', password)
	await page.click('button:has-text("Create Account")')
	await expect(page.locator('div#root')).toContainText('We Emailed You')
	await page.screenshot({ path: `./test-results/register-confirm.png` })

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

	// FIXME: move to separate step
	await page.waitForSelector('[data-test-id=assets-list] a')
	const assetsLinksCount = await page
		.locator('[data-test-id=assets-list] a')
		.count()
	expect(assetsLinksCount).toBeGreaterThan(1)
	await page.screenshot({ path: `./test-results/assets.png` })

	// sign out
	await page.click('text=Sign out')
	await expect(page.locator('div#root')).toContainText(short_name)
	await expect(page.locator('div#root')).toContainText('Sign in')
})
