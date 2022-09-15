import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import { TextAsButton } from 'components/Asset/Settings/textAsButton.js'
import formatDuration from 'date-fns/formatDuration'
import intervalToDuration from 'date-fns/intervalToDuration'

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
				<p id="mvres-config-explainer" data-test="mvres-config-explainer">
					When in motion the tracker will send an update to the cloud every
					<TextAsButton
						role="button"
						tabIndex={0}
						onClick={() => mvresRef.current?.focus()}
						onKeyPress={() => mvresRef.current?.focus()}
					>
						{getTime(settings.mvres)}
					</TextAsButton>
				</p>

				<p id="accito-config-explainer" data-test="accito-config-explainer">
					When motion stops for more than
					<TextAsButton
						role="button"
						tabIndex={0}
						onClick={() => accitoRef.current?.focus()}
						onKeyPress={() => accitoRef.current?.focus()}
					>
						{getTime(settings.accito)}
					</TextAsButton>
					, an update will be sent to the cloud.
				</p>

				<p id="mvt-config-explainer" data-test="mvt-config-explainer">
					If not in motion an update will be sent to the cloud every
					<TextAsButton
						role="button"
						tabIndex={0}
						onClick={() => mvtRef.current?.focus()}
						onKeyPress={() => mvtRef.current?.focus()}
					>
						{getTime(settings.mvt)}
					</TextAsButton>
				</p>
			</div>
		</aside>
	)
}
