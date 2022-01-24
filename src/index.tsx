import '@aws-amplify/ui-react/styles.css'
import { App } from 'app/App'
import { Auth } from 'app/Auth'
import { AuthProvider } from 'hooks/useAuth'
import { IotProvider } from 'hooks/useIot'
import * as ReactDOM from 'react-dom'

ReactDOM.render(
	<Auth>
		{(authProps) => (
			<AuthProvider {...authProps}>
				<IotProvider>
					<App />
				</IotProvider>
			</AuthProvider>
		)}
	</Auth>,
	document.getElementById('root'),
)
