import type { ICredentials } from '@aws-amplify/core'
import type { CognitoUserAmplify } from '@aws-amplify/ui'
import type { useAuthenticator } from '@aws-amplify/ui-react'
import { Auth } from 'aws-amplify'
import {
	createContext,
	FunctionComponent,
	useContext,
	useEffect,
	useState,
} from 'react'

type AuthContextType = {
	signOut: ReturnType<typeof useAuthenticator>['signOut']
	user: CognitoUserAmplify
	attributes: Record<string, string>
	credentials?: ICredentials
}

export const AuthContext = createContext<AuthContextType>(undefined as any)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: FunctionComponent<
	Pick<AuthContextType, 'user' | 'signOut'>
> = ({ children, signOut, user }) => {
	const [attributes, setAttributes] = useState<Record<string, string>>({})
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
					{},
				) ?? {},
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

	return (
		<AuthContext.Provider
			value={{
				signOut,
				user,
				attributes,
				credentials,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}
