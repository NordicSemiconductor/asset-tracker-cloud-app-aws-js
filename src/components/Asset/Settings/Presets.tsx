import type { Static } from '@sinclair/typebox'
import type { AssetConfig } from 'asset/asset'

export const presetConfigs: Record<
	string,
	{
		config: Static<typeof AssetConfig>
		label: string
		description: string
	}
> = {
	parcel: {
		config: {
			act: false, // passive mode
			mvres: 3600, // movement resolution
			accath: 10, // Accelerometer activity threshold
			accith: 5, // Accelerometer inactivity threshold
			accito: 1200, // Accelerometer inactivity timeout
			mvt: 21600, // Movement Timeout
			actwt: 10,
			gnsst: 10,
			nod: [],
		},
		label: 'Parcel Config',
		description: 'Used for tracking parcels.',
	},
	walking: {
		config: {
			act: false, // passive mode
			mvres: 300, // movement resolution
			accath: 10, // Accelerometer activity threshold
			accith: 5, // Accelerometer inactivity threshold
			accito: 60, // Accelerometer inactivity timeout
			mvt: 3600, // Movement Timeout
			actwt: 10,
			gnsst: 10,
			nod: [],
		},
		label: 'Walking Config',
		description: 'When you want to track your hiking.',
	},
}

export const Presets = ({
	setDesiredConfig,
	currentDesiredConfig,
}: {
	setDesiredConfig: any
	currentDesiredConfig: any
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
