import { AssetInformation } from 'components/Asset/AssetInformation'
import { DeleteAsset } from 'components/Asset/DeleteAsset'
import { InfoHeader } from 'components/Asset/InfoHeader'
import { Personalization } from 'components/Asset/Personalization'
import { HelpNote } from 'components/Asset/Settings/HelpNote'
import { Settings } from 'components/Asset/Settings/Settings'
import { Collapsable } from 'components/Collapsable'
import {
	BatteryIcon,
	ButtonIcon,
	CellularIcon,
	DangerIcon,
	FOTAIcon,
	IconWithText,
	InfoIcon,
	NeighboringCellsIcon,
	SettingsIcon,
	ThermometerIcon,
} from 'components/FeatherIcon'
import { FOTA } from 'components/FOTA/FOTA'
import { BatteryChart } from 'components/HistoricalData/BatteryChart'
import { ButtonPresses } from 'components/HistoricalData/ButtonPresses'
import { RSRPChart } from 'components/HistoricalData/RSRPChart'
import { TemperatureChart } from 'components/HistoricalData/TemperatureChart'
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
							<MapWithSettings asset={asset} />
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
								data-intro="This shows hard- and software, and connection information about the asset. Click to reveal the information."
							>
								<AssetInformation twin={twin} />
							</Collapsable>
							<Collapsable
								title={
									<IconWithText>
										<SettingsIcon size={22} />
										Settings
									</IconWithText>
								}
								id="cat:settings"
								data-intro="This allows to change the run-time configuration of the asset."
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
							<Collapsable
								id="asset:fota"
								title={
									<IconWithText>
										<FOTAIcon size={22} /> Firmware Upgrade (
										<abbr title="Firmware Upgrade over the air">FOTA</abbr>)
									</IconWithText>
								}
								data-intro="This allows to schedule firmware upgrades of the air for the asset."
							>
								<FOTA />
							</Collapsable>
							<Collapsable
								id="asset:neighboringcells"
								title={
									<IconWithText>
										<NeighboringCellsIcon size={22} /> Neighboring cells
									</IconWithText>
								}
								data-intro="This shows the most recent neighboring cells the asset able to identify."
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
								data-intro="This shows a history chart of the signal quality."
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
								data-intro="This shows a history chart of the asset's battery voltage."
							>
								<BatteryChart />
							</Collapsable>
							<Collapsable
								id="asset:temperature"
								title={
									<IconWithText>
										<ThermometerIcon size={22} /> Temperature
									</IconWithText>
								}
								data-intro="This shows a history chart of the temperature measured by the asset's environment sensor."
							>
								<TemperatureChart />
							</Collapsable>
							<Collapsable
								id="asset:button"
								title={
									<IconWithText>
										<ButtonIcon size={22} /> Button
									</IconWithText>
								}
								data-intro="This shows the button presses registered by the asset."
							>
								<ButtonPresses />
							</Collapsable>
							<Collapsable
								id="asset:danger"
								title={
									<IconWithText>
										<DangerIcon size={22} /> Danger zone
									</IconWithText>
								}
								data-intro="This allows to delete the asset."
							>
								<DeleteAsset
									onDeleted={() => {
										setDeleted(true)
										reload()
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
