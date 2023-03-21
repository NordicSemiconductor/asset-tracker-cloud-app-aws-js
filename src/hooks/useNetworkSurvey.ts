import {
	fetchNetworkSurveys,
	type ParsedNetworkSurvey,
} from 'api/fetchNetworkSurveys'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import { useServices } from 'hooks/useServices'
import { useEffect, useState } from 'react'

export const useNetworkSurvey = (): ParsedNetworkSurvey | undefined => {
	const [report, setReport] = useState<ParsedNetworkSurvey>()
	const { asset } = useAsset()
	const { dynamoDB } = useServices()
	const { networkSurveyTableName } = useAppConfig()

	useEffect(() => {
		if (asset === undefined) return

		fetchNetworkSurveys({
			dynamoDB,
			networkSurveyTableName,
		})({ asset, Limit: 1 })
			.then((reports) => setReport(reports[0]))
			.catch((err) => console.error(`[useNetworkSurvey]`, err))
	}, [asset, dynamoDB, networkSurveyTableName])

	return report
}
