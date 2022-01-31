import { IconWithText, LoadingIcon } from 'components/FeatherIcon'

export const Loading = ({ children }: { children?: string }) => (
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
