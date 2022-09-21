import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'
import { presetConfigs } from 'asset/config.js'
import styles from 'components/Asset/Settings/Presets.module.css'
import { Collapsable } from 'components/Collapsable.js'

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
			<h5 className={styles.title}>Preset asset configuration</h5>
			<p id="description">Recommended setting values for common use cases</p>
			<div>
				{Object.keys(presetConfigs).map((element) => (
					<Collapsable
						key={element}
						title={<h4>{presetConfigs[`${element}`].label}</h4>}
						id={element}
						data-intro="This shows hard- and software, and connection information about the asset. Click to reveal the information."
					>
						<p className={styles.explanation}>
							{presetConfigs[`${element}`].description}
						</p>
						<div className={styles.alignToRight}>
							<button
								key={`${element}-preset-config`}
								id={`${element}-preset-config`}
								data-test={`${element}-preset-config`}
								type="button"
								className="btn btn-primary"
								onClick={() => presetConfig(element)}
							>
								Apply
							</button>
						</div>
					</Collapsable>
				))}
			</div>
		</div>
	)
}
