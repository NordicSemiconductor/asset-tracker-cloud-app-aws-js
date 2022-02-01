import type { Asset } from 'asset/asset'
import { IconWithText, LoadMoreIcon } from 'components/FeatherIcon'
import { Loading } from 'components/Loading'
import { NoData } from 'components/NoData'
import { useAssets } from 'hooks/useAssets'
import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

export const Assets = () => {
	const { assets, next } = useAssets()
	const [initalLoad, setInitialLoad] = useState<boolean>(false)

	// Always load first page
	useEffect(() => {
		if (initalLoad) return
		setInitialLoad(true)
		next?.()
	}, [next, initalLoad])

	return (
		<main className="container">
			<div className="row justify-content-center">
				<div className="col-md-10 col-lg-8 col-xl-6">
					<div
						className="card"
						data-intro="This card lists the assets in your project. Click on one to see its details."
					>
						<div className="card-header d-flex align-items-center justify-content-between">
							<span className="me-4">Assets</span>
						</div>

						<AssetsList assets={assets} />

						<div className="card-footer d-flex justify-content-end align-items-center">
							<button
								type="button"
								className="btn btn-outline-secondary"
								disabled={next === undefined}
								onClick={next}
								data-intro="Click this button to load more devices."
							>
								<IconWithText>
									<LoadMoreIcon />
									Load more
								</IconWithText>
							</button>
						</div>
					</div>
				</div>
			</div>
		</main>
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
