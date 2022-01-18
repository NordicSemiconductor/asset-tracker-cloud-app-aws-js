import '@aws-amplify/ui-react/styles.css'
import { App } from 'app/App'
import { Auth } from 'app/Auth'
import Amplify from 'aws-amplify'
import { AuthProvider } from 'hooks/useAuth'
import * as React from 'react'
import * as ReactDOM from 'react-dom'

Amplify.configure({
	Auth: {
		identityPoolId: import.meta.env.PUBLIC_IDENTITY_POOL_ID,
		region: import.meta.env.PUBLIC_REGION,
		userPoolId: import.meta.env.PUBLIC_USER_POOL_ID,
		userPoolWebClientId: import.meta.env.PUBLIC_USER_POOL_CLIENT_ID,
		mandatorySignIn: true,
	},
})

ReactDOM.render(
	<Auth>
		{(authProps) => (
			<AuthProvider {...authProps}>
				<App />
			</AuthProvider>
		)}
	</Auth>,
	document.getElementById('root'),
)
