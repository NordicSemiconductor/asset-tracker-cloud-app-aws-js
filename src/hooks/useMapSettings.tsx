import { Type } from '@sinclair/typebox'
import equal from 'fast-deep-equal'
import {
	createContext,
	useContext,
	useState,
	type FunctionComponent,
	type ReactNode,
} from 'react'
import { withLocalStorage } from 'utils/withLocalStorage'

export type Settings = {
	enabledLayers: {
		headings: boolean
		singleCellGeoLocations: boolean
		neighboringCellGeoLocations: boolean
	}
	history: {
		gnss: boolean
		maxGnssEntries: number
		singleCell: boolean
		maxSingleCellGeoLocationEntries: number
		neighboringCell: boolean
		maxNeighboringCellGeoLocationEntries: number
	}
	follow: boolean
	zoom: number
}

const SettingsType = Type.Object(
	{
		follow: Type.Boolean(),
		enabledLayers: Type.Object(
			{
				headings: Type.Boolean(),
				singleCellGeoLocations: Type.Boolean(),
				neighboringCellGeoLocations: Type.Boolean(),
			},
			{ additionalProperties: false },
		),
		history: Type.Object(
			{
				gnss: Type.Boolean(),
				maxGnssEntries: Type.Integer({ minimum: 1 }),
				singleCell: Type.Boolean(),
				maxSingleCellGeoLocationEntries: Type.Integer({ minimum: 1 }),
				neighboringCell: Type.Boolean(),
				maxNeighboringCellGeoLocationEntries: Type.Integer({ minimum: 1 }),
			},
			{ additionalProperties: false },
		),
		zoom: Type.Integer({ minimum: 1 }),
	},
	{ additionalProperties: false },
)

const defaultSettings: Settings = {
	follow: true,
	enabledLayers: {
		headings: true,
		singleCellGeoLocations: true,
		neighboringCellGeoLocations: true,
	},
	history: {
		gnss: true,
		maxGnssEntries: 100,
		singleCell: false,
		maxSingleCellGeoLocationEntries: 100,
		neighboringCell: false,
		maxNeighboringCellGeoLocationEntries: 100,
	},
	zoom: 13,
}

const userSettings = withLocalStorage({
	schema: SettingsType,
	key: 'map:settings',
	defaultValue: defaultSettings,
})

export const MapSettingsContext = createContext<{
	settings: Settings
	update: (_: Partial<Settings>) => void
}>({
	settings: defaultSettings,
	update: () => undefined,
})

export const useMapSettings = () => useContext(MapSettingsContext)

export const MapSettingsProvider: FunctionComponent<{
	children: ReactNode
}> = ({ children }) => {
	const [settings, update] = useState<Settings>(userSettings.get())

	return (
		<MapSettingsContext.Provider
			value={{
				settings,
				update: (newSettings: Partial<Settings>) => {
					update((settings) => {
						const updated = { ...settings, ...newSettings }
						if (equal(updated, settings)) return settings
						userSettings.set(updated)
						return updated
					})
				},
			}}
		>
			{children}
		</MapSettingsContext.Provider>
	)
}
