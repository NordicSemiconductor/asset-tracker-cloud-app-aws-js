if (import.meta.env.PUBLIC_SENTRY_DSN !== undefined) {
	Promise.all([import('@sentry/react'), import('@sentry/tracing')])
		.then(([Sentry, { BrowserTracing }]) => {
			Sentry.init({
				dsn: import.meta.env.PUBLIC_SENTRY_DSN,
				integrations: [new BrowserTracing()],
				tracesSampleRate: 0.1,
			})
			console.debug(`[Sentry]`, 'enabled')
		})
		.catch((err) => {
			console.error(`[Sentry]`, err)
		})
} else {
	console.debug(`[Sentry]`, 'disabled')
}
