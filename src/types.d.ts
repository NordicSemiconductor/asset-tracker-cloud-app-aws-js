declare module '*.svg' {
	const ref: string
	export default ref
}
declare module '*.png' {
	const ref: string
	export default ref
}

declare module '*.css'

/* eslint-disable @typescript-eslint/consistent-type-definitions */
interface ImportMeta {
	hot: {
		accept: () => unknown
		dispose: () => unknown
	}
	env: {
		// Vite built-in
		MODE: string
		BASE_URL?: string
		// Custom
		PUBLIC_VERSION: string
		PUBLIC_HOMEPAGE?: string
		PUBLIC_MANIFEST_NAME: string
		PUBLIC_MANIFEST_SHORT_NAME: string
		PUBLIC_MANIFEST_THEME_COLOR: string
		PUBLIC_MANIFEST_BACKGROUND_COLOR: string
		// AWS settings
		PUBLIC_IDENTITY_POOL_ID: string
		PUBLIC_REGION: string
		PUBLIC_USER_POOL_ID: string
		PUBLIC_USER_POOL_CLIENT_ID: string
		// Sentry settings
		PUBLIC_SENTRY_DSN?: string
		// App settings
		PUBLIC_IDENTITY_POOL_ID: string
		PUBLIC_REGION: string
		PUBLIC_USER_POOL_ID: string
		PUBLIC_USER_POOL_CLIENT_ID: string
		PUBLIC_VERSION: string
		PUBLIC_HOMEPAGE: string
		PUBLIC_MANIFEST_SHORT_NAME: string
		PUBLIC_MANIFEST_NAME: string
		PUBLIC_MANIFEST_THEME_COLOR: string
		PUBLIC_MANIFEST_BACKGROUND_COLOR: string
		PUBLIC_MQTT_ENDPOINT: string
		PUBLIC_USER_IOT_POLICY_NAME: string
		PUBLIC_NETWORKSURVEY_STORAGE_TABLE_NAME: string
		PUBLIC_GEOLOCATION_API_URL: string
		PUBLIC_HISTORICALDATA_TABLE_INFO: string
		PUBLIC_FOTA_BUCKET_NAME: string
		PUBLIC_NETWORK_SURVEY_GEOLOCATION_API_URL: string
	}
}
