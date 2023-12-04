import type { CredentialsAndIdentityId } from '@aws-amplify/core'
import { QueryCommand } from '@aws-sdk/client-timestream-query'
import {
	parseResult,
	queryClient,
} from '@nordicsemiconductor/timestream-helpers'
import { format } from 'date-fns'

export const timeStreamFormatDate = (d: Date): string =>
	format(
		// Make sure the timezone is not dropped.
		new Date(
			d.getUTCFullYear(),
			d.getUTCMonth(),
			d.getUTCDate(),
			d.getUTCHours(),
			d.getUTCMinutes(),
			d.getUTCSeconds(),
		),
		'yyyy-MM-dd HH:mm:ss.SSS',
	)

export type TimestreamService = {
	query: <Result extends Record<string, any>>(
		fn: (table: string) => string,
	) => Promise<Result[]>
	formatDate: (d: Date) => string
}

export const timestreamService = ({
	db,
	table,
	region,
	credentials: { credentials },
}: {
	db: string
	table: string
	region: string
	credentials: Required<CredentialsAndIdentityId>
}): TimestreamService => {
	const queryClientPromise = queryClient(
		{
			region,
			credentials,
		},
		{ defaultRegion: region },
	)
	return {
		query: async <Result extends Record<string, any>>(
			queryStringFn: (table: string) => string,
		) => {
			const QueryString = queryStringFn(`"${db}"."${table}"`)
			try {
				const client = await queryClientPromise
				const res = await client.send(new QueryCommand({ QueryString }))
				const result = parseResult<Result>(res)
				console.debug('[Timestream]', {
					timestreamQuery: QueryString,
					result,
				})
				return result
			} catch (error) {
				// Highlight error
				const querySyntaxRx =
					/The query syntax is invalid at line ([0-9]+):([0-9]+)/
				const querySyntaxErrorMatch = querySyntaxRx.exec(
					(error as Error).message,
				)
				const columnDoesNotExistRx = /Column '([^']+)' does not exist/
				const columnDoesNotExistErrorMatch = columnDoesNotExistRx.exec(
					(error as Error).message,
				)
				if (querySyntaxErrorMatch) {
					const lines = QueryString.split('\n')
					const line = parseInt(querySyntaxErrorMatch[1], 10)
					const col = parseInt(querySyntaxErrorMatch[2], 10)
					const indent = (s: string) => `   ${s}`
					console.error('[Timestream]', {
						timestreamQuery: [
							...lines.slice(0, line).map(indent),
							`-- ${' '.repeat(col - 1)}^`,
							...lines.slice(line).map(indent),
						].join('\n'),
						error,
					})
				} else if (columnDoesNotExistErrorMatch) {
					console.warn(
						'[Timestream]',
						`${
							(error as Error).message
						}. This can happen if the data that the query expects does not exist yet in the database.`,
						{ QueryString },
					)
				} else {
					console.error('[Timestream]', {
						timestreamQuery: QueryString,
						error,
					})
				}
				throw error
			}
		},
		formatDate: timeStreamFormatDate,
	}
}
