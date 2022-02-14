import { SensorProperties } from 'asset/asset'
import { ChartDateRange } from 'components/ChartDateRange'
import { NoData } from 'components/NoData'
import { RelativeTime } from 'components/RelativeTime'
import { useAssetHistory } from 'hooks/useAssetHistory'

export const ButtonPresses = () => {
	const history = useAssetHistory<{
		date: Date
		value: number
	}>({
		query: ({ asset, table, startDate, endDate, binInterval }) => `
		SELECT
        time as date,
        measure_value::double AS value
		FROM ${table}
		WHERE deviceId='${asset.id}' 
		AND measure_name='${SensorProperties.Button}' 
		AND time >= '${startDate}'
		AND time <= '${endDate}'
		ORDER BY time DESC
	`,
	})

	if (history.length === 0)
		return (
			<>
				<ChartDateRange hideBinControls />
				<NoData />
			</>
		)

	return (
		<>
			<ChartDateRange hideBinControls />
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
