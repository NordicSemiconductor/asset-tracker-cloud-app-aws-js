export enum DataModules {
	GNSS = 'gnss',
	NeigboringCellMeasurements = 'ncell',
}

export type AssetConfig = {
	act: boolean
	actwt: number
	mvres: number
	mvt: number
	gpst: number
	acct: number
	nod: DataModules[]
}

export type AssetState = {
	cfg?: Partial<AssetConfig>
}

type AssetStateMetadata =
	| {
			timestamp?: number
	  }
	| { [key: string]: AssetStateMetadata }

export type AssetTwin = {
	reported: AssetState
	desired: AssetState
	metadata: AssetStateMetadata
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
