import { About } from 'app/pages/About.js'
import { Account } from 'app/pages/Account.js'
import { Asset } from 'app/pages/Asset.js'
import { Assets } from 'app/pages/Assets.js'
import { MapWithAllAssets } from 'app/pages/Map.js'
import { Navbar } from 'components/Navbar.js'
import { useAppConfig } from 'hooks/useAppConfig.js'
import {
	Navigate,
	Route,
	BrowserRouter as Router,
	Routes,
} from 'react-router-dom'

export const App = () => {
	const { basename } = useAppConfig()
	return (
		<Router basename={basename}>
			<Navbar />
			<Routes>
				<Route index element={<Navigate to="/assets" />} />
				<Route path="/assets" element={<Assets />} />
				<Route path="/map" element={<MapWithAllAssets />} />
				<Route path="/asset/:id" element={<Asset />} />
				<Route path="/account" element={<Account />} />
				<Route path="/about" element={<About />} />
			</Routes>
		</Router>
	)
}
