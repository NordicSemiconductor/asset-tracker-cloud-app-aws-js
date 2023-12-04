import type { CredentialsAndIdentityId } from '@aws-amplify/core'
import type { useAuthenticator } from '@aws-amplify/ui-react'
import {
	deleteUser,
	fetchAuthSession,
	fetchUserAttributes,
	type AuthUser,
} from 'aws-amplify/auth'
import {
	createContext,
	useContext,
	useEffect,
	useState,
	type FunctionComponent,
} from 'react'

type CognitoUserAttributes = {
	sub: string
	email_verified: boolean
	email: string
}
type AuthContextType = {
	signOut: ReturnType<typeof useAuthenticator>['signOut']
	user: AuthUser
	attributes?: CognitoUserAttributes
	credentials?: Required<CredentialsAndIdentityId>
	deleteAccount: () => void
}

export const AuthContext = createContext<AuthContextType>(undefined as any)

export const useAuth = () => useContext(AuthContext)

/**
 * This component loads the credentials necessary to interact with AWS services and makes them available to children using a property. This way all child components can rely on the presence of these credentials.
 */
export const AuthProvider: FunctionComponent<
	Pick<AuthContextType, 'user' | 'signOut'> & {
		children: ({
			credentials,
		}: {
			credentials: Required<CredentialsAndIdentityId>
		}) => JSX.Element
		loadingScreen: JSX.Element
	}
> = ({ children, signOut, user, loadingScreen }) => {
	const [attributes, setAttributes] = useState<CognitoUserAttributes>()
	const [credentials, setCredentials] =
		useState<Required<CredentialsAndIdentityId>>()

	// Fetch user profile
	useEffect(() => {
		fetchUserAttributes()
			.then((attributes) => {
				console.log(`[useAuth]`, attributes)
				setAttributes(attributes as unknown as CognitoUserAttributes)
			})
			.catch((error) => console.error('[useAuth]', error))
	}, [user])

	// Get API credentials
	useEffect(() => {
		fetchAuthSession()
			.then(({ credentials, identityId }) => {
				if (credentials === undefined || identityId === undefined)
					throw new Error(`Failed to fetch credentials.`)
				setCredentials({
					credentials,
					identityId,
				})
			})
			.catch((error) => console.error('[useAuth]', error))
	}, [user])

	if (credentials === undefined) return <>{loadingScreen}</>

	return (
		<AuthContext.Provider
			value={{
				signOut,
				user,
				attributes,
				credentials,
				deleteAccount: () => {
					deleteUser()
						.then(() => {
							signOut()
						})
						.catch((error) => console.error('[useAuth]', error))
				},
			}}
		>
			{children({ credentials })}
		</AuthContext.Provider>
	)
}
