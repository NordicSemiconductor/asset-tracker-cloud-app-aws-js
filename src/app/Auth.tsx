import type { CognitoUserAmplify } from '@aws-amplify/ui'
import { Authenticator, useAuthenticator } from '@aws-amplify/ui-react'
import '@aws-amplify/ui-react/styles.css'
import * as React from 'react'
import logo from '/logo-stroke-width-1.svg'

export const Auth = ({
	children,
}: {
	children: ({
		signOut,
		user,
	}: {
		signOut: ReturnType<typeof useAuthenticator>['signOut']
		user: CognitoUserAmplify
	}) => JSX.Element
}) => (
	<Authenticator
		loginMechanisms={['email']}
		variation="modal"
		components={{
			Header: () => (
				<h1 className="fs-2 d-flex flex-column align-items-center mb-4 mt-4 fw-light text-center">
					<img
						src={logo}
						alt={import.meta.env.PUBLIC_MANIFEST_NAME}
						className="mb-2"
						style={{ width: '10%' }}
					/>
					{import.meta.env.PUBLIC_MANIFEST_SHORT_NAME}
				</h1>
			),
		}}
	>
		{children}
	</Authenticator>
)
