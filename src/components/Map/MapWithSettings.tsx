import type { AssetWithTwin } from 'asset/asset'
import { MapSettings } from 'components/Map/Settings'
import { ShowSettingsButton } from 'components/Map/ShowSettingsButton'
import { SingleAssetMap } from 'components/Map/SingleAssetMap'
import { MapSettingsProvider } from 'hooks/useMapSettings'
import { useState } from 'react'

export const MapWithSettings = ({ asset, twin }: AssetWithTwin) => {
	const [showSettings, toggleSettings] = useState<boolean>(false)
	return (
		<MapSettingsProvider>
			<div style={{ position: 'relative' }}>
				<SingleAssetMap asset={asset} twin={twin} />
				<ShowSettingsButton
					onToggle={(collapsed) => toggleSettings(!collapsed)}
				/>
			</div>
			{showSettings && <MapSettings />}
		</MapSettingsProvider>
	)
}
