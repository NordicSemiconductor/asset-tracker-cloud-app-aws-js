import equal from 'fast-deep-equal'
import { createContext, FunctionComponent, useContext, useState } from 'react'
import { withLocalStorage } from 'utils/withLocalStorage'

export type Settings = {
	enabledLayers: {
		headings: boolean
		singleCellGeoLocations: boolean
		neighboringCellGeoLocations: boolean
		gnssHistory: boolean
		singleCellGeoLocationHistory: boolean
		neighboringCellGeoLocationHistory: boolean
	}
	follow: boolean
	zoom: number
	maxGnssHistoryEntries: number
	maxSingleCellGeoLocationHistoryEntries: number
	maxNeighboringCellGeoLocationHistoryEntries: number
}

const defaultSettings: Settings = {
	follow: true,
	enabledLayers: {
		headings: false,
		singleCellGeoLocations: false,
		neighboringCellGeoLocations: false,
		gnssHistory: false,
		singleCellGeoLocationHistory: false,
		neighboringCellGeoLocationHistory: false,
	},
	zoom: 13,
	maxGnssHistoryEntries: 100,
	maxSingleCellGeoLocationHistoryEntries: 100,
	maxNeighboringCellGeoLocationHistoryEntries: 100,
}

const userSettings = withLocalStorage<Settings>({
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

export const MapSettingsProvider: FunctionComponent = ({ children }) => {
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
