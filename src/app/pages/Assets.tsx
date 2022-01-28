import { IconWithText, LoadMoreIcon } from 'components/FeatherIcon'
import { NoData } from 'components/NoData'
import { useIot } from 'hooks/useIot'
import { Link } from 'react-router-dom'

export const Assets = () => {
	const { things, next } = useIot()

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
						{things.length === 0 && (
							<div className="card-body">
								<NoData />
							</div>
						)}
						{things.length > 0 && (
							<table className="table" data-test-id="assets-list">
								<tbody>
									{things.map((thing, key) => (
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
						)}
						<div className="card-footer d-flex justify-content-end align-items-center">
							<button
								type="button"
								className="btn btn-outline-secondary"
								disabled={next === undefined}
								onClick={next}
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
