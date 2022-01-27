import {
	AdminConfirmSignUpCommand,
	AdminUpdateUserAttributesCommand,
	CognitoIdentityProviderClient,
} from '@aws-sdk/client-cognito-identity-provider'
import { fromEnv } from '@nordicsemiconductor/from-env'

const upc = new CognitoIdentityProviderClient({})

const { UserPoolId } = fromEnv({
	UserPoolId: 'PUBLIC_USER_POOL_ID',
})(process.env)

export const confirmSignUp = async (email: string): Promise<void> => {
	console.debug(`Confirming ${email} ...`)
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
