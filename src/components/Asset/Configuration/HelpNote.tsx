import { Type } from '@sinclair/typebox'
import { HelpIcon, IconWithText } from 'components/FeatherIcon'
import introJs from 'intro.js'
import { useState } from 'react'
import { withLocalStorage } from 'utils/withLocalStorage'

const intro = introJs()

const storedHidden = withLocalStorage({
	schema: Type.Boolean(),
	key: 'settings:helpNoteHidden',
	defaultValue: false,
})

export const HelpNote = () => {
	const [hidden, setHidden] = useState<boolean>(storedHidden.get())
	if (hidden) return null
	return (
		<div
			className="alert alert-info mt-4 d-flex justify-content-between align-items-center"
			role="alert"
			id="asset-configuration-help-note"
		>
			<span>
				Click
				<button
					type="button"
					className="btn btn-link"
					onClick={() => {
						window.requestAnimationFrame(() => {
							intro.start().catch(console.error)
						})
					}}
				>
					<IconWithText>
						<HelpIcon />
						Help
					</IconWithText>
				</button>
				to view a detailed description of the settings.
			</span>
			<button
				type="button"
				className="btn-close"
				aria-label="Close"
				onClick={() => {
					storedHidden.set(true)
					setHidden(true)
				}}
			></button>
		</div>
	)
}
