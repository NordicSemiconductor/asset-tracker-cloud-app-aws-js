import { AssetInformation } from 'components/Asset/AssetInformation'
import { DeleteAsset } from 'components/Asset/DeleteAsset'
import { Collapsable } from 'components/Collapsable'
import { DangerIcon, IconWithText, InfoIcon } from 'components/FeatherIcon'
import { Loading } from 'components/Loading'
import { Main } from 'components/Main'
import { useAsset } from 'hooks/useAsset'
import { useAssets } from 'hooks/useAssets'
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'

export const Asset = () => {
	const { id } = useParams()
	const { setAssetId, asset, twin, deleteAsset } = useAsset()
	const { reload } = useAssets()
	const [deleted, setDeleted] = useState<boolean>(false)

	useEffect(() => {
		setAssetId(id)
		return () => {
			setAssetId()
		}
	}, [id, setAssetId])

	if (deleted)
		return (
			<Main>
				<div className="card">
					<div className="card-body">
						<div className="alert alert-success mb-0" role="alert">
							Asset <code>{id}</code> has been deleted.
						</div>
					</div>
				</div>
			</Main>
		)

	return (
		<Main>
			<div className="card">
				<div className="card-header d-flex align-items-center justify-content-between">
					<span className="me-4">{id}</span>
				</div>
				<div className="card-body">
					{asset === undefined && (
						<Loading>
							<span>
								Loading <code>{id}</code> ...
							</span>
						</Loading>
					)}
					{asset !== undefined && (
						<>
							<Collapsable
								title={
									<IconWithText>
										<InfoIcon size={22} />
										Asset Information
									</IconWithText>
								}
								id="cat:information"
							>
								<AssetInformation asset={asset} twin={twin} />
							</Collapsable>
							<Collapsable
								id="asset:danger"
								title={
									<IconWithText>
										<DangerIcon size={22} /> Danger zone
									</IconWithText>
								}
							>
								<DeleteAsset
									onDelete={() => {
										deleteAsset()
											.then(() => {
												setDeleted(true)
												reload()
											})
											.catch((err) => console.error(`[delete asset]`, err))
									}}
								/>
							</Collapsable>
						</>
					)}
				</div>
			</div>
		</Main>
	)
}
