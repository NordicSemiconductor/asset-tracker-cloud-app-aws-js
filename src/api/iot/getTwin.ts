import {
	GetThingShadowCommand,
	IoTDataPlaneClient,
} from '@aws-sdk/client-iot-data-plane'
import { toUtf8 } from '@aws-sdk/util-utf8-browser'
import { toReported } from 'api/toReported.js'
import type { AssetTwin } from 'asset/asset.js'

const noTwin = (): AssetTwin => ({
	reported: {},
	desired: {},
	metadata: {},
	version: -1,
})

export const getTwin =
	({ iotData }: { iotData: IoTDataPlaneClient }) =>
	async (thingName: string): Promise<AssetTwin> =>
		iotData
			.send(
				new GetThingShadowCommand({
					thingName,
				}),
			)
			.then(({ payload }) => {
				const twin: AssetTwin = noTwin()
				if (payload !== undefined) {
					const shadow = JSON.parse(toUtf8(payload))
					if (shadow.state !== undefined) {
						twin.reported = toReported(shadow.state.reported ?? {})
						twin.desired = shadow.state.desired ?? {}
						twin.metadata = shadow.metadata ?? {}
						twin.version = shadow.version ?? -1
					}
				}
				return twin
			})
			.catch((err) => {
				if (err.name !== 'ResourceNotFoundException') {
					console.error(`Failed to fetch thing shadow`, err)
				}
				return noTwin()
			})
