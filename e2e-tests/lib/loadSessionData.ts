import { promises as fs } from 'fs'
import * as path from 'path'
import type { AssetType } from '../authenticated/lib.js'

export const loadSessionData = async (
	name: 'user' | AssetType,
): Promise<Record<string, string>> =>
	JSON.parse(await fs.readFile(getSessionFile(name), 'utf-8'))

export const getSessionFile = (name: 'user' | AssetType): string =>
	path.join(process.cwd(), 'test-session', `${name}.json`)
