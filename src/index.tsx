import '@aws-amplify/ui-react/styles.css'
import { App } from 'app/App.js'
import { Auth } from 'app/Auth.js'
import { Loading } from 'components/Loading.js'
import { AssetProvider } from 'hooks/useAsset.js'
import { AssetLocationHistoryProvider } from 'hooks/useAssetLocationHistory.js'
import { AssetsProvider } from 'hooks/useAssets.js'
import { AuthProvider } from 'hooks/useAuth.js'
import { CurrentChartDateRangeProvider } from 'hooks/useChartDateRange.js'
import { ChartDateRangePresetProvider } from 'hooks/useChartDateRangePreset.js'
import { FOTAProvider } from 'hooks/useFOTA.js'
import { MapDataProvider } from 'hooks/useMapData.js'
import { MapSettingsProvider } from 'hooks/useMapSettings.js'
import { ServicesProvider } from 'hooks/useServices.js'
import { createRoot } from 'react-dom/client'
import 'utils/sentry'

const container = document.getElementById('root') as HTMLElement
const root = createRoot(container)
root.render(
	<Auth>
		{(authProps) => {
			const { signOut, user } = authProps ?? {}
			if (signOut === undefined || user === undefined) return <></>
			return (
				<AuthProvider
					signOut={() => {
						signOut()
					}}
					user={user}
					loadingScreen={<Loading />}
				>
					{({ credentials }) => (
						<ServicesProvider credentials={credentials}>
							<AssetsProvider>
								<AssetProvider>
									<FOTAProvider>
										<MapSettingsProvider>
											<CurrentChartDateRangeProvider>
												<ChartDateRangePresetProvider>
													<AssetLocationHistoryProvider>
														<MapDataProvider>
															<App />
														</MapDataProvider>
													</AssetLocationHistoryProvider>
												</ChartDateRangePresetProvider>
											</CurrentChartDateRangeProvider>
										</MapSettingsProvider>
									</FOTAProvider>
								</AssetProvider>
							</AssetsProvider>
						</ServicesProvider>
					)}
				</AuthProvider>
			)
		}}
	</Auth>,
)
