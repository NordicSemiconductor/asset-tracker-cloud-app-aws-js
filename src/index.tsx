import '@aws-amplify/ui-react/styles.css'
import { App } from 'app/App'
import { Auth } from 'app/Auth'
import { Loading } from 'components/Loading'
import { AssetProvider } from 'hooks/useAsset'
import { AssetsProvider } from 'hooks/useAssets'
import { AuthProvider } from 'hooks/useAuth'
import { CurrentChartDateRangeProvider } from 'hooks/useChartDateRange'
import { ServicesProvider } from 'hooks/useServices'
import * as ReactDOM from 'react-dom'

ReactDOM.render(
	<Auth>
		{(authProps) => (
			<AuthProvider {...authProps} loadingScreen={<Loading />}>
				{({ credentials }) => (
					<ServicesProvider credentials={credentials}>
						<AssetsProvider>
							<AssetProvider>
								<CurrentChartDateRangeProvider>
									<App />
								</CurrentChartDateRangeProvider>
							</AssetProvider>
						</AssetsProvider>
					</ServicesProvider>
				)}
			</AuthProvider>
		)}
	</Auth>,
	document.getElementById('root'),
)
