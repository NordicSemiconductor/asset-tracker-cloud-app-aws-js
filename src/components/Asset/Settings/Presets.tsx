import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import { presetConfigs } from 'asset/config.js'
import styles from 'components/Asset/Settings/Presets.module.css'
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
						Preset asset configuration
					</IconWithText>
				}
				id="cat:presets"
				data-intro="This shows recommended settings values for asset configuration. Click to reveal the information."
				data-test="presets-collapsible"
			>
				<div>
					<p id="about">Recommended setting values for common use cases</p>
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
										className="btn btn-primary"
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
