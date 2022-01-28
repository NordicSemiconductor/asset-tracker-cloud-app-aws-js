import { Account } from 'app/pages/Account'
import { Assets } from 'app/pages/Assets'
import { Navbar } from 'components/Navbar'
import { useAppConfig } from 'hooks/useAppConfig'
import {
	BrowserRouter as Router,
	Navigate,
	Route,
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
				<Route path="/account" element={<Account />} />
			</Routes>
		</Router>
	)
}
