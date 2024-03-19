import type { Asset } from 'asset/asset.js'
import { MapSettings } from 'components/Map/Settings.js'
import { ShowSettingsButton } from 'components/Map/ShowSettingsButton.js'
import { SingleAssetMap } from 'components/Map/SingleAssetMap.js'
import { useState } from 'react'

export const MapWithSettings = ({ asset }: { asset: Asset }) => {
	const [showSettings, toggleSettings] = useState<boolean>(false)
	return (
		<>
			<div style={{ position: 'relative' }}>
				<SingleAssetMap asset={asset} />
				<ShowSettingsButton
					onToggle={(collapsed) => toggleSettings(!collapsed)}
				/>
			</div>
			{showSettings && <MapSettings />}
		</>
	)
}
