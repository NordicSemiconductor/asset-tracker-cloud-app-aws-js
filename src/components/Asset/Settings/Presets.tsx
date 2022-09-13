import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import { presetConfigs } from 'asset/config.js'

// TODO: rename component because everything in the context is called 'Settings' instead of 'presets config'
export const Presets = ({
	setDesiredConfig,
	currentDesiredConfig,
}: {
	setDesiredConfig: React.Dispatch<
		React.SetStateAction<Static<typeof AssetConfig>>
	>
	currentDesiredConfig: Static<typeof AssetConfig>
}) => {
	const presetConfig = (id: string) => {
		const config =
			presetConfigs[`${id}`] !== undefined
				? presetConfigs[`${id}`].config
				: currentDesiredConfig
		setDesiredConfig(config)
	}

	return (
		<>
			<h4>Pre-set configurations</h4>
			{
				// TODO: test information is rendering properly
				Object.keys(presetConfigs).map((element) => (
					<button
						key={`${element}-preset-config`}
						id={`${element}-preset-config`}
						data-test={`${element}-preset-config`}
						type="button"
						className={'btn btn-secondary'}
						onClick={() => presetConfig(element)} // TODO: test the onClick
					>
						{presetConfigs[`${element}`].label}
					</button>
				))
			}
		</>
	)
}
