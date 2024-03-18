import { Authenticator } from '@aws-amplify/ui-react'
import type { AuthenticatorProps } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import { useAppConfig } from 'hooks/useAppConfig.js'
import logo from '/logo-stroke-width-1.svg'

export const Auth = ({
	children,
}: {
	children: AuthenticatorProps['children']
}) => {
	const {
		manifest: { name, shortName },
	} = useAppConfig()
	return (
		<Authenticator
			loginMechanisms={['email']}
			variation="modal"
			components={{
				Header: () => (
					<h1 className="fs-2 d-flex flex-column align-items-center mb-4 mt-4 fw-light text-center">
						<img
							src={logo}
							alt={name}
							className="mb-2"
							style={{ width: '10%' }}
						/>
						{shortName}
					</h1>
				),
			}}
		>
			{children}
		</Authenticator>
	)
}
