import { promises as fs } from 'fs'
import * as path from 'path'
import { AssetType } from '../authenticated/lib'

export const loadSessionData = async (
	name: 'user' | AssetType,
): Promise<Record<string, string>> =>
	JSON.parse(
		await fs.readFile(
			path.join(process.cwd(), 'test-session', `${name}.json`),
			'utf-8',
		),
	)
