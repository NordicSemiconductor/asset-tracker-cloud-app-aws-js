import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import { TextAsButton } from 'components/Asset/Settings/textAsButton'
import formatDuration from 'date-fns/formatDuration'
import intervalToDuration from 'date-fns/intervalToDuration'

export const SettingsExplainer = ({
	settings,
	references,
}: {
	settings: Static<typeof AssetConfig>
	references: any // TODO: set proper type </typeof>
}) => {
	const getTime = (value: number) => {
		if (isNaN(value)) return '... click here to fill input'
		return ` ${formatDuration(
			intervalToDuration({ start: 0, end: value * 1000 }),
		)} (${value} seconds)`
	}

	return (
		<aside>
			<h4>Configuration explainer</h4>
			<div>
				<p data-test="mvres-config-explainer">
					When in motion the tracker will send an update to the cloud every
					<TextAsButton
						role="button"
						tabIndex={0}
						onClick={references.mvres.setter}
						onKeyPress={references.mvres.setter}
					>
						{getTime(settings.mvres)}
					</TextAsButton>
				</p>

				<p data-test="accito-config-explainer">
					When motion stops for more than
					<TextAsButton
						role="button"
						tabIndex={0}
						onClick={references.accito.setter}
						onKeyPress={references.accito.setter}
					>
						{getTime(settings.accito)}
					</TextAsButton>
					, an update will be sent to the cloud.
				</p>

				<p data-test="mvt-config-explainer">
					If not in motion an update will be sent to the cloud every
					<TextAsButton
						role="button"
						tabIndex={0}
						onClick={references.mvt.setter}
						onKeyPress={references.mvt.setter}
					>
						{getTime(settings.mvt)}
					</TextAsButton>
				</p>
			</div>
		</aside>
	)
}
