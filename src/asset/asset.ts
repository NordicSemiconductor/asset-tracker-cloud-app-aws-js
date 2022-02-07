export type Asset = { id: string; name: string; version: number }
export type AssetWithTwin = {
	asset: Asset
	twin: AssetTwin
}

export enum DataModules {
	GNSS = 'gnss',
	NeigboringCellMeasurements = 'ncell',
}

export type AssetConfig = {
	act: boolean
	actwt: number
	mvres: number
	mvt: number
	gnsst: number
	acct: number
	nod: DataModules[]
}

export type AssetState = {
	cfg?: Partial<AssetConfig>
}

export type UnixTimeInSeconds = number
export type UnixTimeInMilliseconds = number
export type ReportedSensor<A> = {
	v: A
	ts: UnixTimeInMilliseconds
}

export type ReportedState = AssetState & {
	gnss?: ReportedSensor<GNSS>
	bat?: ReportedSensor<Battery>
	dev?: ReportedSensor<AssetInfo>
	roam?: ReportedSensor<Roaming>
	env?: ReportedSensor<Environment>
}
export type DesiredState = AssetState

type AssetStateMetadata = Record<
	string,
	{ timestamp: UnixTimeInSeconds } & { [key: string]: AssetStateMetadata }
>

/**
 * @see https://docs.aws.amazon.com/iot/latest/developerguide/device-shadow-document.html#device-shadow-example-response-json
 */
export type AssetTwin = {
	reported: ReportedState
	desired: DesiredState
	metadata: AssetStateMetadata
	version: number
}

export type Battery = number
export type Button = number
export type Environment = {
	temp: number
	hum: number
	atmp: number
}
export type GNSS = {
	acc: number
	alt: number
	hdg: number
	lat: number
	lng: number
	spd: number
}
export type Roaming = {
	area: number
	mccmnc: number
	cell: number
	ip: string
	rsrp: number
	band: string
	nw: string
}
export type AssetInfo = {
	iccid: string
	imei: string
	modV: string
	brdV: string
	appV: string
}
export type NCellMeasReport = {
	reportId: string
	nw: string
	mcc: number
	mnc: number
	cell: number
	area: number
	earfcn: number
	adv: number
	rsrp: number
	rsrq: number
	nmr?: {
		earfcn: number
		cell: number
		rsrp: number
		rsrq: number
	}[]
	reportedAt: Date
	receivedAt: Date
	unresolved?: boolean
	position?: {
		lat: number
		lng: number
		accuracy: number
	}
}

export type AssetSensor =
	| Battery
	| GNSS
	| Environment
	| Roaming
	| AssetInfo
	| NCellMeasReport
	| Button
export type AssetHistoryDatum<T extends AssetSensor> = {
	ts: UnixTimeInMilliseconds
	v: T
}
export type AssetHistory<T extends AssetSensor> = AssetHistoryDatum<T>[]
