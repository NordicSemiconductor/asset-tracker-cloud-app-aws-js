import { useAppConfig } from 'hooks/useAppConfig'
import { useAuth } from 'hooks/useAuth'
import React from 'react'

export const About = () => {
	const { version, homepage } = useAppConfig()
	const { credentials, attributes } = useAuth()

	return (
		<main className="container">
			<div className="row justify-content-center">
				<div className="col-md-10 col-lg-8 col-xl-6">
					<div
						className="card"
						data-intro="Did you know that this application is open source? Check out the links!"
					>
						<div className="card-header">About</div>
						<div className="card-body">
							<p>
								This is the web application of the <em>nRF Asset Tracker</em>{' '}
								which aims to provide a concrete end-to-end sample for an IoT
								product in the asset tracker space. You can find the source code
								on{' '}
								<a
									href={homepage.toString()}
									target="_blank"
									rel="noopener noreferrer"
								>
									GitHub
								</a>
								.
							</p>
							<p>
								Please also consider the{' '}
								<a
									href={
										'https://nordicsemiconductor.github.io/asset-tracker-cloud-docs/'
									}
									target="_blank"
									rel="noopener noreferrer"
								>
									nRF Asset Tracker
								</a>{' '}
								documentation.
							</p>
							<dl>
								<dt>Version</dt>
								<dd>
									<code>{version}</code>
								</dd>
							</dl>
						</div>
					</div>
					<div
						className="card mt-4"
						data-intro="This lists information about the current loggedin user."
					>
						<div className="card-header">User</div>
						<div className="card-body">
							<dl>
								<dt>ID</dt>
								<dd>
									<code>{credentials?.identityId}</code>
								</dd>
								<dt>E-Mail</dt>
								<dd>
									<code>{attributes?.email}</code>
								</dd>
							</dl>
						</div>
					</div>
					<div
						className="card mt-4"
						data-intro="This card shows the environment variables configure during build time of the application."
					>
						<div className="card-header">Environment</div>
						<div className="card-body">
							<dl>
								{Object.entries(import.meta.env).map(([k, v]) => (
									<React.Fragment key={k}>
										<dt>{k}</dt>
										<dd>
											<code>
												{v === undefined
													? 'N/A'
													: typeof v === 'string'
													? v
													: JSON.stringify(v)}
											</code>
										</dd>
									</React.Fragment>
								))}
							</dl>
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
