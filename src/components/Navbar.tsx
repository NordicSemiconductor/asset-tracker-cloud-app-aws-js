import {
	HelpIcon,
	IconWithText,
	InfoIcon,
	LogoutIcon,
	MapIcon,
	ParcelIcon,
	UserIcon,
} from 'components/FeatherIcon'
import styles from 'components/Navbar.module.css'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import { useAuth } from 'hooks/useAuth'
import introJs from 'intro.js'
import { useState } from 'react'
import { Link } from 'react-router-dom'
import logo from '/logo-white-outline.svg'

const intro = introJs()

export const Navbar = () => {
	const { signOut: logout } = useAuth()
	const {
		manifest: { backgroundColor, shortName, name },
	} = useAppConfig()
	const { asset } = useAsset()
	const [navbarOpen, setNavbarOpen] = useState<boolean>(false)

	const close = () => {
		setNavbarOpen(false)
	}

	return (
		<header>
			<nav
				className="navbar navbar-expand-lg navbar-dark"
				style={{
					backgroundColor,
				}}
			>
				<div className="container-fluid">
					<Link className="navbar-brand d-flex align-items-center" to="/">
						<img
							src={logo}
							alt={name}
							width="30"
							height="24"
							className="d-inline-block align-text-top me-1"
						/>
						{asset && <span className={styles.assetName}>{asset.name}</span>}
						{!asset && (
							<span className={styles.assetName}>
								{shortName} <small>(AWS)</small>
							</span>
						)}
					</Link>
					<button
						className="navbar-toggler"
						type="button"
						aria-controls="navbar"
						aria-expanded={navbarOpen}
						aria-label="Toggle navigation"
						onClick={() => {
							setNavbarOpen((open) => !open)
						}}
					>
						<span className="navbar-toggler-icon"></span>
					</button>
					<div
						className={`navbar-collapse ${navbarOpen ? '' : 'collapse'}`}
						id="navbar"
					>
						<ul className="navbar-nav me-auto">
							<li className="nav-item">
								<Link className="nav-link" to="/assets" onClick={close}>
									<ParcelIcon /> Assets
								</Link>
							</li>
							<li className="nav-item">
								<Link className="nav-link" to="/map" onClick={close}>
									<IconWithText>
										<MapIcon /> Map
									</IconWithText>
								</Link>
							</li>
							<li className="nav-item">
								<Link className="nav-link" to="/about" onClick={close}>
									<IconWithText>
										<InfoIcon /> About
									</IconWithText>
								</Link>
							</li>
							<li className="nav-item">
								<button
									type="button"
									className="btn btn-link nav-link"
									style={{ fontWeight: 'var(--bs-body-font-weight)' }}
									onClick={() => {
										if (navbarOpen) {
											close()
											// Leave time for navbar to close
											window.setTimeout(() => {
												intro.start()
											}, 500)
										} else {
											intro.start()
										}
									}}
								>
									<IconWithText>
										<HelpIcon /> Help
									</IconWithText>
								</button>
							</li>
						</ul>

						<div className="d-flex justify-content-between align-items-center">
							<ul className="navbar-nav me-4">
								<li className="nav-item">
									<Link className="nav-link" to="/account" onClick={close}>
										<IconWithText>
											<UserIcon /> Account
										</IconWithText>
									</Link>
								</li>
							</ul>

							<button
								type="button"
								className="btn btn-outline-light"
								onClick={() => {
									close()
									logout()
								}}
							>
								<IconWithText>
									<LogoutIcon />
									Sign out
								</IconWithText>
							</button>
						</div>
					</div>
				</div>
			</nav>
		</header>
	)
}
