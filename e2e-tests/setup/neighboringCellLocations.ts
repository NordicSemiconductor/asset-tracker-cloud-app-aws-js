import { Static } from '@sinclair/typebox'
import { NCellMeasReport } from 'asset/asset.js'
import id128 from 'id128'
import { state } from './asset-reported-state.js'

export const neighboringCellLocations = ({
	thingName,
}: {
	thingName: string
}): Static<typeof NCellMeasReport>[] => [
	{
		reportId: id128.Uuid4.generate().toCanonical(),
		nw: state.roam.v.nw,
		deviceId: thingName,
		timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
		unresolved: false,
		lng: 10.394017,
		lat: 63.417746,
		accuracy: 2000,
		report: {
			mcc: 242,
			mnc: 1,
			cell: 30976,
			area: 30401,
			earfcn: 6300,
			adv: 48,
			rsrp: -82,
			rsrq: -8,
			nmr: [
				{
					earfcn: 6300,
					cell: 293,
					rsrp: -87,
					rsrq: -14,
				},
				{
					earfcn: 6300,
					cell: 194,
					rsrp: -94,
					rsrq: -21,
				},
			],
			ts: Date.now() - 11 * 60 * 1000,
		},
	},
	{
		reportId: id128.Uuid4.generate().toCanonical(),
		nw: state.roam.v.nw,
		deviceId: thingName,
		timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
		unresolved: false,
		accuracy: 91,
		lat: 63.793945,
		lng: 11.486816,
		report: {
			area: 31801,
			adv: 80,
			nmr: [
				{
					rsrp: -88,
					cell: 444,
					rsrq: -18,
					earfcn: 6400,
				},
			],
			mnc: 1,
			rsrq: -7,
			rsrp: -75,
			mcc: 242,
			cell: 18933760,
			earfcn: 6400,
			ts: Date.now() - 12 * 60 * 1000,
		},
	},
	{
		reportId: id128.Uuid4.generate().toCanonical(),
		nw: state.roam.v.nw,
		deviceId: thingName,
		timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
		unresolved: false,
		accuracy: 886,
		lat: 63.79517414,
		lng: 11.50304609,
		report: {
			area: 31801,
			adv: 65535,
			nmr: [
				{
					rsrp: -84,
					cell: 73,
					rsrq: -18,
					earfcn: 6400,
				},
				{
					rsrp: -84,
					cell: 444,
					rsrq: -14,
					earfcn: 6400,
				},
			],
			mnc: 1,
			rsrq: -7,
			rsrp: -74,
			mcc: 242,
			cell: 18933760,
			earfcn: 6400,
			ts: Date.now() - 13 * 60 * 1000,
		},
	},
	{
		reportId: id128.Uuid4.generate().toCanonical(),
		nw: state.roam.v.nw,
		deviceId: thingName,
		timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
		unresolved: false,
		accuracy: 1174,
		lat: 63.80781751,
		lng: 11.51768887,
		report: {
			area: 31801,
			adv: 65535,
			nmr: [
				{
					rsrp: -82,
					cell: 444,
					rsrq: -10,
					earfcn: 6400,
				},
			],
			mnc: 1,
			rsrq: -7,
			rsrp: -71,
			mcc: 242,
			cell: 18933760,
			earfcn: 6400,
			ts: Date.now() - 14 * 60 * 1000,
		},
	},
]
