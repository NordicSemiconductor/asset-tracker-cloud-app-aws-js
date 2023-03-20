import type { ICredentials } from '@aws-amplify/core'
import type { CognitoUserAmplify } from '@aws-amplify/ui'
import type { useAuthenticator } from '@aws-amplify/ui-react'
import { Auth } from 'aws-amplify'
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
	user: CognitoUserAmplify
	attributes?: CognitoUserAttributes
	credentials?: ICredentials
	deleteAccount: () => void
}

export const AuthContext = createContext<AuthContextType>(undefined as any)

export const useAuth = () => useContext(AuthContext)

/**
 * This component loads the credentials neccessary to interact with AWS services and makes them available to children using a property. This way all child components can rely on the presence of these credentials.
 */
export const AuthProvider: FunctionComponent<
	Pick<AuthContextType, 'user' | 'signOut'> & {
		children: ({ credentials }: { credentials: ICredentials }) => JSX.Element
		loadingScreen: JSX.Element
	}
> = ({ children, signOut, user, loadingScreen }) => {
	const [attributes, setAttributes] = useState<CognitoUserAttributes>()
	const [credentials, setCredentials] = useState<ICredentials>()

	// Fetch user profile
	useEffect(() => {
		user.getUserAttributes((err, attributes) => {
			if (err !== null) {
				console.error(`Failed to fetch user attributes!`)
				console.error(err)
				return
			}
			setAttributes(
				attributes?.reduce(
					(attributes, { Name, Value }) => ({ ...attributes, [Name]: Value }),
					{} as CognitoUserAttributes,
				) ?? ({} as CognitoUserAttributes),
			)
		})
	}, [user])

	// Get API credentials
	useEffect(() => {
		Auth.currentCredentials()
			.then(Auth.essentialCredentials)
			.then(setCredentials)
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
					user.deleteUser((error) => {
						if (error !== undefined && error !== null) {
							console.error(error)
						} else {
							signOut()
						}
					})
				},
			}}
		>
			{children({ credentials })}
		</AuthContext.Provider>
	)
}
