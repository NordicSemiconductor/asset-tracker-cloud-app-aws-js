import { AssetInformation } from 'components/Asset/AssetInformation'
import { DeleteAsset } from 'components/Asset/DeleteAsset'
import { Collapsable } from 'components/Collapsable'
import { DangerIcon, IconWithText, InfoIcon } from 'components/FeatherIcon'
import { Loading } from 'components/Loading'
import { useAsset } from 'hooks/useAsset'
import { useEffect } from 'react'
import { useParams } from 'react-router-dom'

export const Asset = () => {
	const { id } = useParams()
	const { setAssetId, asset, twin } = useAsset()

	useEffect(() => {
		setAssetId(id)
		return () => {
			setAssetId()
		}
	}, [id, setAssetId])

	return (
		<main className="container">
			<div className="row justify-content-center">
				<div className="col-md-10 col-lg-8 col-xl-6">
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
										<DeleteAsset />
									</Collapsable>
								</>
							)}
						</div>
					</div>
				</div>
			</div>
		</main>
	)
}
