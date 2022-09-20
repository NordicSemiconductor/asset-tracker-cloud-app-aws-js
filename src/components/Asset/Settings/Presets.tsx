import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import { presetConfigs } from 'asset/config.js'
import styles from 'components/Asset/Settings/Presets.module.css'
import { Collapsable } from 'components/Collapsable'
import { IconWithText } from 'components/FeatherIcon'

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
		<div className={styles.presets}>
			<h5 className={styles.title}>Pre-set configurations</h5>
			<p>
				sdjfhjksd sdfhj sdf sdfsldfsdfsdfs sdfsdfj sdf sdfhsdf dfgopdfgnsdf
				sdfhgsdf sdfgndsfjsd sdfk
			</p>
			<div>
				{
					// TODO: test information is rendering properly
					Object.keys(presetConfigs).map((element) => (
						<Collapsable
							title={
								<IconWithText>
									<h4>{presetConfigs[`${element}`].label}</h4>
								</IconWithText>
							}
							id="cat:information"
							data-intro="This shows hard- and software, and connection information about the asset. Click to reveal the information."
						>
							<p className={styles.explanation}>
								sdafhkasdfj hasdasdfhas dfnasdjkfhas dfnasdhjkfgh asdfjhasdfasdf
								asdkfhas dfjasd fasdhgfasdf asdfhbasdfygsadfas dfhasdfasdfasdfh
								xcahgsdf
							</p>
							<div className={styles.alignToRight}>
								<button
									key={`${element}-preset-config`}
									id={`${element}-preset-config`}
									data-test={`${element}-preset-config`}
									type="button"
									className="btn btn-primary"
									onClick={() => presetConfig(element)} // TODO: test the onClick
								>
									Apply
								</button>
							</div>
						</Collapsable>
					))
				}
			</div>
		</div>
	)
}
