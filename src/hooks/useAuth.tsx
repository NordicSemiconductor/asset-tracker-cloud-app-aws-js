import type { CognitoUserAmplify } from '@aws-amplify/ui'
import type { useAuthenticator } from '@aws-amplify/ui-react'
import React, {
	createContext,
	FunctionComponent,
	useContext,
	useEffect,
	useState,
} from 'react'

type AuthContext = {
	signOut: ReturnType<typeof useAuthenticator>['signOut']
	user: CognitoUserAmplify
	attributes: Record<string, string>
}

export const AuthContext = createContext<AuthContext>(undefined as any)

export const useAuth = () => useContext(AuthContext)

export const AuthProvider: FunctionComponent<
	Pick<AuthContext, 'user' | 'signOut'>
> = ({ children, signOut, user }) => {
	const [attributes, setAttributes] = useState<Record<string, string>>({})

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

	return (
		<AuthContext.Provider
			value={{
				signOut,
				user,
				attributes,
			}}
		>
			{children}
		</AuthContext.Provider>
	)
}
