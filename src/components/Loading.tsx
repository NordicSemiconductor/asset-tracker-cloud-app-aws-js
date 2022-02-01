import { IconWithText, LoadingIcon } from 'components/FeatherIcon'
import type { FunctionComponent, PropsWithChildren } from 'react'

export const Loading: FunctionComponent<PropsWithChildren<any>> = ({
	children,
}) => (
	<div
		style={{
			backgroundColor: '#eee',
			borderRadius: '5px',
			display: 'flex',
			height: '50px',
			justifyContent: 'space-around',
			alignItems: 'center',
		}}
	>
		<IconWithText>
			<LoadingIcon />
			{children ?? 'Loading ...'}
		</IconWithText>
	</div>
)
