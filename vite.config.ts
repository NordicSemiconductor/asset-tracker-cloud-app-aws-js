import react from '@vitejs/plugin-react'
import fs from 'fs'
import path from 'path'
import { defineConfig } from 'vite'
import { injectHtml } from 'vite-plugin-html'

const { version, homepage } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'package.json'), 'utf-8'),
)

const { short_name, name, theme_color, background_color } = JSON.parse(
	fs.readFileSync(path.join(process.cwd(), 'public', 'manifest.json'), 'utf-8'),
)

process.env.PUBLIC_VERSION = version ?? Date.now()
process.env.PUBLIC_HOMEPAGE = homepage
process.env.PUBLIC_MANIFEST_SHORT_NAME = short_name
process.env.PUBLIC_MANIFEST_NAME = name
process.env.PUBLIC_MANIFEST_THEME_COLOR = theme_color
process.env.PUBLIC_MANIFEST_BACKGROUND_COLOR = background_color

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [
		react(),
		injectHtml({
			data: {
				name,
				shortName: short_name,
				themeColor: theme_color,
				version,
			},
		}),
	],
	base: `${(process.env.BASE_URL ?? '').replace(/\/+$/, '')}/`,
	preview: {
		host: 'localhost',
		port: 8080,
	},
	server: {
		host: 'localhost',
		port: 8080,
	},
	resolve: {
		alias: [
			{ find: 'app/', replacement: '/src/app/' },
			{ find: 'hooks/', replacement: '/src/hooks/' },
			{ find: 'components/', replacement: '/src/components/' },
			{ find: 'util/', replacement: '/src/util/' },
		],
	},
	build: {
		outDir: './build',
	},
	envPrefix: 'PUBLIC_',
})
