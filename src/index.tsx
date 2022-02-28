import '@aws-amplify/ui-react/styles.css'
import { App } from 'app/App'
import { Auth } from 'app/Auth'
import { Loading } from 'components/Loading'
import { AssetProvider } from 'hooks/useAsset'
import { AssetLocationHistoryProvider } from 'hooks/useAssetLocationHistory'
import { AssetsProvider } from 'hooks/useAssets'
import { AuthProvider } from 'hooks/useAuth'
import { CurrentChartDateRangeProvider } from 'hooks/useChartDateRange'
import { FOTAProvider } from 'hooks/useFOTA'
import { MapDataProvider } from 'hooks/useMapData'
import { MapSettingsProvider } from 'hooks/useMapSettings'
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
								<FOTAProvider>
									<MapSettingsProvider>
										<CurrentChartDateRangeProvider>
											<AssetLocationHistoryProvider>
												<MapDataProvider>
													<App />
												</MapDataProvider>
											</AssetLocationHistoryProvider>
										</CurrentChartDateRangeProvider>
									</MapSettingsProvider>
								</FOTAProvider>
							</AssetProvider>
						</AssetsProvider>
					</ServicesProvider>
				)}
			</AuthProvider>
		)}
	</Auth>,
	document.getElementById('root'),
)
