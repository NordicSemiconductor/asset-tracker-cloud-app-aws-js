import type { Asset } from 'asset/asset.js'
import {
	IconWithText,
	LoadMoreIcon,
	ReloadIcon,
} from 'components/FeatherIcon.js'
import { Loading } from 'components/Loading.js'
import { Main } from 'components/Main.js'
import { NoData } from 'components/NoData.js'
import { useAssets } from 'hooks/useAssets.js'
import { Link } from 'react-router-dom'

export const Assets = () => {
	const { assets, next, reload } = useAssets()

	return (
		<Main>
			<div
				className="card"
				data-intro="This card lists the assets in your project. Click on one to see its details."
			>
				<div className="card-header d-flex align-items-center justify-content-between">
					<span className="me-4">Assets</span>
					<button
						type="button"
						className="btn btn-link"
						style={{ padding: 0 }}
						onClick={() => reload()}
						data-intro="Click this button to reload the list of assets."
					>
						<ReloadIcon />
					</button>
				</div>

				<AssetsList assets={assets} />

				<div className="card-footer d-flex justify-content-end align-items-center">
					<button
						type="button"
						className="btn btn-outline-secondary"
						disabled={next === undefined}
						onClick={next}
						data-intro="Click this button to load more assets."
					>
						<IconWithText>
							<LoadMoreIcon />
							Load more
						</IconWithText>
					</button>
				</div>
			</div>
		</Main>
	)
}

const AssetsList = ({ assets }: { assets?: Asset[] }) => {
	if (assets === undefined)
		return (
			<div className="card-body">
				<Loading />
			</div>
		)
	if (assets.length === 0)
		return (
			<div className="card-body">
				<NoData />
			</div>
		)
	return (
		<table className="table" data-test-id="assets-list">
			<tbody>
				{assets.map((thing, key) => (
					<tr key={thing.id}>
						<td>
							<Link
								to={`/asset/${thing.id}`}
								data-intro={
									key === 0
										? `Click on a asset to view its details.`
										: undefined
								}
							>
								{thing.name}
							</Link>
						</td>
					</tr>
				))}
			</tbody>
		</table>
	)
}
