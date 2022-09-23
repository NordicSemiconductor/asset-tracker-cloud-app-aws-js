import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import { explainDuration } from 'components/Asset/Settings/explainDuration.js'
import styles from 'components/Asset/Settings/SettingsExplainer.module.css'

export const SettingsExplainer = ({
	settings,
	mvresRef,
	accitoRef,
	mvtRef,
}: {
	settings: Static<typeof AssetConfig>
	mvresRef: React.RefObject<HTMLInputElement>
	accitoRef: React.RefObject<HTMLInputElement>
	mvtRef: React.RefObject<HTMLInputElement>
}) => {
	return (
		<aside>
			<div className={styles.text}>
				<p id="mvres-config-explainer" data-test="mvres-config-explainer">
					{`When in motion the tracker will send an update to the cloud every `}
					<TextAsButton
						role="button"
						tabIndex={0}
						onClick={() => mvresRef.current?.focus()}
						onKeyPress={() => mvresRef.current?.focus()}
					>
						{explainDuration(settings.mvres)}
					</TextAsButton>
				</p>
				<p id="accito-config-explainer" data-test="accito-config-explainer">
					{`When motion stops for more than `}
					<TextAsButton
						role="button"
						tabIndex={0}
						onClick={() => accitoRef.current?.focus()}
						onKeyPress={() => accitoRef.current?.focus()}
					>
						{explainDuration(settings.accito)}
					</TextAsButton>
					, an update will be sent to the cloud.
				</p>
				<p id="mvt-config-explainer" data-test="mvt-config-explainer">
					{`If not in motion an update will be sent to the cloud every `}
					<TextAsButton
						role="button"
						tabIndex={0}
						onClick={() => mvtRef.current?.focus()}
						onKeyPress={() => mvtRef.current?.focus()}
					>
						{explainDuration(settings.mvt)}
					</TextAsButton>
				</p>
			</div>
		</aside>
	)
}

const TextAsButton = ({
	role,
	tabIndex,
	onClick,
	onKeyPress,
	children,
}: {
	role: string
	tabIndex: number
	onClick: () => any
	onKeyPress: () => any
	children: React.ReactNode
}) => {
	return (
		<button
			role={role}
			tabIndex={tabIndex}
			onClick={() => onClick()}
			onKeyPress={() => onKeyPress()}
			className={'btn btn-link p-0'}
			style={{ marginTop: '-3px' }}
		>
			{children}
		</button>
	)
}
