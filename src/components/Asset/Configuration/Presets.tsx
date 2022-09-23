import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import { presetConfigs } from 'asset/config.js'
import styles from 'components/Asset/Configuration/Presets.module.css'
import { Collapsable } from 'components/Collapsable.js'
import { IconWithText, InfoIcon } from 'components/FeatherIcon.js'

export const Presets = ({
	setDesiredConfig,
}: {
	setDesiredConfig: React.Dispatch<
		React.SetStateAction<Static<typeof AssetConfig>>
	>
	currentDesiredConfig: Static<typeof AssetConfig>
}) => {
	return (
		<div className={styles.wrapper}>
			<Collapsable
				title={
					<IconWithText>
						<InfoIcon size={22} />
						Configuration Presets
					</IconWithText>
				}
				id="cat:presets"
				data-intro="This provides sensible presets for different scenarios."
				data-test="presets-collapsible"
			>
				<div>
					<p id="about">
						Below are configuration presets that provide sensible defaults for
						typical application scenarios. Click 'Apply' to apply these settings
						to the asset.
					</p>
					<div>
						{Object.keys(presetConfigs).map((element) => (
							<section className={styles.preset} id={element} key={element}>
								<header className={` ${styles.information}`}>
									<div id={`${element}-info`}>
										<h5 className={styles.title}>
											{presetConfigs[`${element}`].label}
										</h5>
										<p>{presetConfigs[`${element}`].description}</p>
									</div>
									<button
										key={`${element}-preset-config`}
										id={`${element}-preset-config`} // action
										data-test={`${element}-preset-config`}
										type="button"
										className="btn btn-primary ms-2"
										onClick={() =>
											setDesiredConfig(presetConfigs[`${element}`].config)
										}
									>
										Apply
									</button>
								</header>
							</section>
						))}
					</div>
				</div>
			</Collapsable>
		</div>
	)
}
