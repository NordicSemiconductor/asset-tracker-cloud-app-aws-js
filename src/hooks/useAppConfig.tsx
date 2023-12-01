import { fromEnv } from '@nordicsemiconductor/from-env'
import { Amplify } from 'aws-amplify'
import { createContext, useContext } from 'react'

const {
	identityPoolId,
	region,
	userPoolId,
	userPoolClientId,
	version,
	homepage,
	shortName,
	name,
	themeColor,
	backgroundColor,
	mqttEndpoint,
	userIotPolicyName,
	geolocationApiEndpoint,
	historicaldataTableInfo,
	fotaBucketName,
	networkSurveyGeolocationApiEndpoint,
	networkSurveyTableName,
} = fromEnv({
	identityPoolId: 'PUBLIC_IDENTITY_POOL_ID',
	region: 'PUBLIC_REGION',
	userPoolId: 'PUBLIC_USER_POOL_ID',
	userPoolClientId: 'PUBLIC_USER_POOL_CLIENT_ID',
	version: 'PUBLIC_VERSION',
	homepage: 'PUBLIC_HOMEPAGE',
	shortName: 'PUBLIC_MANIFEST_SHORT_NAME',
	name: 'PUBLIC_MANIFEST_NAME',
	themeColor: 'PUBLIC_MANIFEST_THEME_COLOR',
	backgroundColor: 'PUBLIC_MANIFEST_BACKGROUND_COLOR',
	mqttEndpoint: 'PUBLIC_MQTT_ENDPOINT',
	userIotPolicyName: 'PUBLIC_USER_IOT_POLICY_NAME',
	geolocationApiEndpoint: 'PUBLIC_GEOLOCATION_API_URL',
	historicaldataTableInfo: 'PUBLIC_HISTORICALDATA_TABLE_INFO',
	fotaBucketName: 'PUBLIC_FOTA_BUCKET_NAME',
	networkSurveyGeolocationApiEndpoint:
		'PUBLIC_NETWORK_SURVEY_GEOLOCATION_API_URL',
	networkSurveyTableName: 'PUBLIC_NETWORKSURVEY_STORAGE_TABLE_NAME',
})(import.meta.env)

Amplify.configure({
	Auth: {
		Cognito: {
			identityPoolId,
			userPoolId,
			userPoolClientId,
			loginWith: {
				username: false,
				phone: false,
				email: true,
			},
		},
	},
})

export const AppConfigContext = createContext<{
	identityPoolId: string
	region: string
	userPoolId: string
	userPoolClientId: string
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
	networkSurveyTableName: string
	networkSurveyGeolocationApiEndpoint: URL
	geolocationApiEndpoint: URL
	timestream: {
		db: string
		table: string
	}
	fotaBucketName: string
	autoUpdateIntervalInSeconds: number
}>({
	identityPoolId,
	region,
	userPoolId,
	userPoolClientId,
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
	networkSurveyTableName,
	networkSurveyGeolocationApiEndpoint: new URL(
		networkSurveyGeolocationApiEndpoint.replace(/\/+$/, ''),
	),
	geolocationApiEndpoint: new URL(geolocationApiEndpoint.replace(/\/+$/, '')),
	timestream: {
		db: historicaldataTableInfo.split('|')[0],
		table: historicaldataTableInfo.split('|')[1],
	},
	fotaBucketName,
	autoUpdateIntervalInSeconds: 60,
})

export const useAppConfig = () => useContext(AppConfigContext)
