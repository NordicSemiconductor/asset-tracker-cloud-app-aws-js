import { IconWithText, XIcon } from 'components/FeatherIcon'

export const NoMap = () => (
	<div
		style={{
			backgroundColor: '#ccc',
			display: 'flex',
			height: '500px',
			justifyContent: 'space-around',
			alignItems: 'center',
		}}
	>
		<IconWithText>
			<XIcon />
			No position known.
		</IconWithText>
	</div>
)
