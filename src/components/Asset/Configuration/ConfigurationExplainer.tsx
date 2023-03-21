import { type ConfigData } from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'
import styles from 'components/Asset/Configuration/ConfigurationExplainer.module.css'
import { explainDuration } from 'components/Asset/Configuration/explainDuration.js'

export const ConfigurationExplainer = ({
	configuration,
	onMovementResolutionClicked,
	onMovementTimeoutClicked,
	onAccelerometerInactivityTimeoutClicked,
}: {
	configuration: ConfigData
	onMovementResolutionClicked: () => unknown
	onAccelerometerInactivityTimeoutClicked: () => unknown
	onMovementTimeoutClicked: () => unknown
}) => {
	return (
		<aside className={styles.text} data-test="configuration-explainer">
			<p data-test="mvres">
				{`When in motion the tracker will send an update to the cloud every `}
				<TextAsButton
					role="button"
					tabIndex={0}
					onClick={onMovementResolutionClicked}
				>
					{explainDuration(configuration.mvres)}
				</TextAsButton>
				.
			</p>
			<p data-test="accito">
				{`When motion stops for more than `}
				<TextAsButton
					role="button"
					tabIndex={0}
					onClick={onAccelerometerInactivityTimeoutClicked}
				>
					{explainDuration(configuration.accito)}
				</TextAsButton>
				, an update will be sent to the cloud.
			</p>
			<p data-test="mvt">
				{`If not in motion an update will be sent to the cloud every `}
				<TextAsButton
					role="button"
					tabIndex={0}
					onClick={onMovementTimeoutClicked}
				>
					{explainDuration(configuration.mvt)}
				</TextAsButton>
				.
			</p>
		</aside>
	)
}

const TextAsButton = ({
	role,
	tabIndex,
	onClick,
	children,
}: {
	role: string
	tabIndex: number
	onClick: () => any
	children: React.ReactNode
}) => {
	return (
		<button
			role={role}
			tabIndex={tabIndex}
			onClick={() => onClick()}
			className={'btn btn-link p-0'}
			style={{ marginTop: '-3px' }}
		>
			{children}
		</button>
	)
}
