import { useAssetLocations } from 'hooks/useAssetLocations'

export const MapWithAllAssets = () => {
	const locations = useAssetLocations()
	return (
		<ul>
			{locations.map((location) => (
				<li key={location.asset.id}>
					{location.asset.name}: {location.position.lat}/{location.position.lng}
				</li>
			))}
		</ul>
	)
}
