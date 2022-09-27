import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset.js'
import { defaultConfig } from 'asset/config.js'
import { Form } from 'components/Asset/Configuration/Form.js'
import { Presets } from 'components/Asset/Configuration/Presets.js'
import { NoData } from 'components/NoData.js'
import { useAsset } from 'hooks/useAsset.js'
import { useEffect, useState } from 'react'

export const Configuration = () => {
	const { twin } = useAsset()

	const [currentDesiredConfig, setCurrentDesiredConfig] =
		useState<Static<typeof AssetConfig>>()

	useEffect(() => {
		if (twin === undefined) return
		setCurrentDesiredConfig({
			...defaultConfig,
			...twin.desired.cfg,
		})
	}, [setCurrentDesiredConfig, twin])
	if (currentDesiredConfig === undefined) return <NoData />
	return <ConfigurationUI currentDesiredConfig={currentDesiredConfig} />
}

const ConfigurationUI = ({
	currentDesiredConfig,
}: {
	currentDesiredConfig: Static<typeof AssetConfig>
}) => {
	const { update, twin } = useAsset()

	const {
		reported: { cfg: reportedConfig },
	} = twin ?? { reported: { cfg: {} as Static<typeof AssetConfig> } }
	const [newDesiredConfig, setNewDesiredConfig] =
		useState<Static<typeof AssetConfig>>(currentDesiredConfig)

	const updateNewDesiredConfig = (cfg: Partial<Static<typeof AssetConfig>>) => {
		const updated = {
			...newDesiredConfig,
			...cfg,
		}
		setNewDesiredConfig(updated)
	}

	/**
	 * Use this state to track wether a preset was applied and use it to reload the form.
	 */
	const [presetApplied, setPresetApplied] = useState<number>(0)

	return (
		<>
			<Presets
				setDesiredConfig={(config: any) => {
					setPresetApplied(presetApplied + 1)
					setNewDesiredConfig(config)
					// update form
					update({ cfg: config }).catch(console.error)
				}}
				currentDesiredConfig={currentDesiredConfig}
			/>
			<Form
				key={`${presetApplied}`}
				{...{
					newDesiredConfig,
					reportedConfig,
					updateNewDesiredConfig: updateNewDesiredConfig,
					currentDesiredConfig,
					onSave: (cfg) => {
						update({
							cfg,
						}).catch(console.error)
					},
				}}
			/>
		</>
	)
}
