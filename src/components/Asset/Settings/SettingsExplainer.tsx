import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import formatDuration from 'date-fns/formatDuration'
import intervalToDuration from 'date-fns/intervalToDuration'

export const SettingsExplainer = ({
	settings,
}: {
	settings: Static<typeof AssetConfig>
}) => {
	const time = (milliseconds: number) => {
		return isNaN(milliseconds)
			? '0 seconds'
			: formatDuration(
					intervalToDuration({ start: 0, end: milliseconds * 1000 }),
			  )
	}

	// todo: add a hyperlink to custom form field
	/*
	const linkToFormField = () => {
		return null
	}*/

	return (
		<aside>
			<h4>Configuration explainer</h4>
			<p data-test="config-explainer">
				{`When in motion the tracker will send an update to the cloud every ${time(
					settings.mvres,
				)} (${settings.mvres} s). 
				When motion stops for more than ${time(settings.accito)} (${
					settings.accito
				} s), an update will be sent to the cloud. 
				If not in motion an update will be sent to the cloud every ${time(
					settings.mvt,
				)} (${settings.mvt} s).`}
			</p>
		</aside>
	)
}
