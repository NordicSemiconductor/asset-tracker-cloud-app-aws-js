import { About } from 'app/pages/About'
import { Account } from 'app/pages/Account'
import { Asset } from 'app/pages/Asset'
import { Assets } from 'app/pages/Assets'
import { MapWithAllAssets } from 'app/pages/Map'
import { Navbar } from 'components/Navbar'
import { useAppConfig } from 'hooks/useAppConfig'
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
