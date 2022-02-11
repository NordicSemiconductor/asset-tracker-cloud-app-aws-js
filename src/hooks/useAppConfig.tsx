import { fromEnv } from '@nordicsemiconductor/from-env'
import Amplify from 'aws-amplify'
import { createContext, useContext } from 'react'

const {
	identityPoolId,
	region,
	userPoolId,
	userPoolWebClientId,
	version,
	homepage,
	shortName,
	name,
	themeColor,
	backgroundColor,
	mqttEndpoint,
	userIotPolicyName,
	nCellMeasReportTableName,
	nCellMeasCellGeolocationApiEndpoint,
	geolocationApiEndpoint,
	historicaldataTableInfo,
} = fromEnv({
	identityPoolId: 'PUBLIC_IDENTITY_POOL_ID',
	region: 'PUBLIC_REGION',
	userPoolId: 'PUBLIC_USER_POOL_ID',
	userPoolWebClientId: 'PUBLIC_USER_POOL_CLIENT_ID',
	version: 'PUBLIC_VERSION',
	homepage: 'PUBLIC_HOMEPAGE',
	shortName: 'PUBLIC_MANIFEST_SHORT_NAME',
	name: 'PUBLIC_MANIFEST_NAME',
	themeColor: 'PUBLIC_MANIFEST_THEME_COLOR',
	backgroundColor: 'PUBLIC_MANIFEST_BACKGROUND_COLOR',
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
	userIotPolicyName: 'PUBLIC_USER_IOT_POLICY_NAME',
	nCellMeasReportTableName: 'PUBLIC_NCELLMEAS_STORAGE_TABLE_NAME',
	nCellMeasCellGeolocationApiEndpoint:
		'PUBLIC_NEIGHBOR_CELL_GEOLOCATION_API_URL',
	geolocationApiEndpoint: 'PUBLIC_GEOLOCATION_API_URL',
	historicaldataTableInfo: 'PUBLIC_HISTORICALDATA_TABLE_INFO',
})(import.meta.env)

Amplify.configure({
	Auth: {
		identityPoolId,
		region,
		userPoolId,
		userPoolWebClientId,
		mandatorySignIn: true,
	},
})

export const AppConfigContext = createContext<{
	identityPoolId: string
	region: string
	userPoolId: string
	userPoolWebClientId: string
	basename: string
	version: string
	homepage: string
	manifest: {
		shortName: string
		name: string
		themeColor: string
		backgroundColor: string
	}
	mqttEndpoint: string
	userIotPolicyName: string
	nCellMeasReportTableName: string
	nCellMeasCellGeolocationApiEndpoint: URL
	geolocationApiEndpoint: URL
	timestream: {
		db: string
		table: string
	}
}>({
	identityPoolId,
	region,
	userPoolId,
	userPoolWebClientId,
	basename: import.meta.env.BASE_URL ?? '/',
	version,
	homepage,
	manifest: {
		shortName,
		name,
		themeColor,
		backgroundColor,
	},
	mqttEndpoint,
	userIotPolicyName,
	nCellMeasReportTableName,
	nCellMeasCellGeolocationApiEndpoint: new URL(
		nCellMeasCellGeolocationApiEndpoint.replace(/\/+$/, ''),
	),
	geolocationApiEndpoint: new URL(geolocationApiEndpoint.replace(/\/+$/, '')),
	timestream: {
		db: historicaldataTableInfo.split('|')[0],
		table: historicaldataTableInfo.split('|')[1],
	},
})

export const useAppConfig = () => useContext(AppConfigContext)
