import { promises as fs } from 'fs'
import * as path from 'path'

export const loadSessionData = async (
	name: 'user' | 'asset',
): Promise<Record<string, string>> =>
	JSON.parse(
		await fs.readFile(
			path.join(process.cwd(), 'test-session', `${name}.json`),
			'utf-8',
		),
	)
