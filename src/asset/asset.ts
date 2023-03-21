import {
	type AWSDesiredData,
	type AWSReportedData,
} from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'

export type Asset = { id: string; name: string; version: number }
export type AssetWithTwin = {
	asset: Asset
	twin: AssetTwin
}

export enum DataModules {
	GNSS = 'gnss',
	NeigboringCellMeasurements = 'ncell',
}

export type UnixTimeInSeconds = number

type AssetStateMetadata = Record<
	string,
	{ timestamp: UnixTimeInSeconds } & { [key: string]: AssetStateMetadata }
>

/**
 * @see https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-document.html#device-shadow-example-response-json
 */
export type AssetTwin = {
	reported: AWSReportedData
	desired: AWSDesiredData
	metadata: AssetStateMetadata
	version: number
}

export enum SensorProperties {
	Battery = 'bat',
	Environment = 'env',
	GNSS = 'gnss',
	Roaming = 'roam',
	Asset = 'dev',
	Button = 'btn',
	Impact = 'impact',
}
