import { ReloadIcon } from 'components/FeatherIcon'
import { CreateFOTAJob } from 'components/FOTA/CreateFOTAJob'
import { Jobs } from 'components/FOTA/Jobs'
import { useAsset } from 'hooks/useAsset'
import { useFOTA } from 'hooks/useFOTA'
import { useEffect } from 'react'

export const FOTA = () => {
	const { asset, twin } = useAsset()
	const { enableAutoUpdate, disableAutoUpdate, reload } = useFOTA()

	useEffect(() => {
		if (asset === undefined) return
		enableAutoUpdate()
		return () => {
			disableAutoUpdate()
		}
	}, [asset, disableAutoUpdate, enableAutoUpdate])

	if (asset === undefined) return null
	return (
		<>
			{twin?.reported?.dev?.v.appV === undefined && (
				<div className="alert alert-danger">
					The device has not yet reported an application version.
				</div>
			)}
			<h4>Schedule a firmware upgrade</h4>
			<CreateFOTAJob asset={asset} />
			<h4 className="mt-4 d-flex justify-content-between align-items-center">
				Firmware upgrades
				<button
					type="button"
					className="btn btn-link"
					style={{ padding: 0 }}
					onClick={() => {
						reload()
					}}
				>
					<ReloadIcon />
				</button>
			</h4>
			<Jobs />
		</>
	)
}
