import { ChartDateRange } from 'components/ChartDateRange/ChartDateRange.js'
import { NoData } from 'components/NoData.js'
import { RelativeTime } from 'components/RelativeTime.js'
import { useAssetButtonPressesHistory } from 'hooks/useAssetButtonPressesHistory.js'

export const ButtonPresses = () => {
	const history = useAssetButtonPressesHistory()

	if (history.length === 0)
		return (
			<>
				<ChartDateRange hideBinControls className="mb-4" />
				<NoData />
			</>
		)

	return (
		<>
			<ChartDateRange hideBinControls className="mb-4" />
			<table className="table button-presses">
				<thead>
					<tr>
						<th>Button</th>
						<th>Time</th>
					</tr>
				</thead>
				<tbody>
					{history.map(({ value, date }, k) => (
						<tr key={k}>
							<td>{value}</td>
							<td>
								{date.toLocaleString()}{' '}
								<small>
									(<RelativeTime ts={date} />)
								</small>
							</td>
						</tr>
					))}
				</tbody>
			</table>
		</>
	)
}
