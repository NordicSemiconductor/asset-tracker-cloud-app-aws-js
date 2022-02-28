import type { Asset } from 'asset/asset'
import { MapSettings } from 'components/Map/Settings'
import { ShowSettingsButton } from 'components/Map/ShowSettingsButton'
import { SingleAssetMap } from 'components/Map/SingleAssetMap'
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
