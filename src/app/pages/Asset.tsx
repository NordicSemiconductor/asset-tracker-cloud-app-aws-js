import { AssetInformation } from 'components/Asset/AssetInformation'
import { DeleteAsset } from 'components/Asset/DeleteAsset'
import { InfoHeader } from 'components/Asset/Info'
import { Personalization } from 'components/Asset/Personalization'
import { HelpNote } from 'components/Asset/Settings/HelpNote'
import { Settings } from 'components/Asset/Settings/Settings'
import { Collapsable } from 'components/Collapsable'
import {
	BatteryIcon,
	CellularIcon,
	DangerIcon,
	IconWithText,
	InfoIcon,
	NeighboringCellsIcon,
	SettingsIcon,
} from 'components/FeatherIcon'
import { BatteryChart } from 'components/HistoricalData/BatteryChart'
import { RSRPChart } from 'components/HistoricalData/RSRPChart'
import { Loading } from 'components/Loading'
import { Main } from 'components/Main'
import { MapWithSettings } from 'components/Map/MapWithSettings'
import { NeighborCellMeasurementsReport } from 'components/NeighborCellMeasurementsReport'
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
				{asset === undefined && (
					<div className="card-header d-flex align-items-center justify-content-between">
						<span className="me-4">{id}</span>
					</div>
				)}
				{asset !== undefined && twin !== undefined && (
					<div className="card-header pt-0 pe-0 pb-0 ps-0">
						<div data-intro="This map shows the location of your asset.">
							<MapWithSettings asset={asset} twin={twin} />
						</div>
						<hr className="mt-0 mb-0" />
						<div
							data-intro="This provides on overview of important asset information."
							id="info-header"
						>
							<InfoHeader asset={asset} twin={twin} />
						</div>
					</div>
				)}
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
								title={
									<IconWithText>
										<SettingsIcon size={22} />
										Settings
									</IconWithText>
								}
								id="cat:settings"
							>
								<h4>Personalization</h4>
								<Personalization
									asset={asset}
									key={`asset-${asset.id}-${asset.version}`}
								/>
								<div data-intro="This allows you change the run-time configuration of the asset.">
									<h4 className="mt-4 ">Asset configuration</h4>
									<HelpNote />
									<Settings key={`asset-${asset.id}-${twin?.version ?? 0}`} />
								</div>
							</Collapsable>
							{/* FIXME: FOTA */}
							<Collapsable
								id="asset:neighboringcells"
								title={
									<IconWithText>
										<NeighboringCellsIcon size={22} /> Neighboring cells
									</IconWithText>
								}
							>
								<NeighborCellMeasurementsReport twin={twin} />
							</Collapsable>
							<Collapsable
								id="asset:rsrp"
								title={
									<IconWithText>
										<CellularIcon size={22} /> RSRP
									</IconWithText>
								}
							>
								<RSRPChart />
							</Collapsable>
							<Collapsable
								id="asset:battery"
								title={
									<IconWithText>
										<BatteryIcon size={22} /> Battery
									</IconWithText>
								}
							>
								<BatteryChart />
							</Collapsable>
							{/* FIXME: Temperature */}
							{/* FIXME: Button */}
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
