import { type ParsedNetworkSurvey } from 'api/fetchNetworkSurveys.js'
import { randomUUID } from 'node:crypto'
import { state } from './asset-reported-state.js'

export const networkSurveys = ({
	thingName,
}: {
	thingName: string
}): ParsedNetworkSurvey[] => [
	{
		surveyId: randomUUID(),
		nw: state.roam.v.nw,
		deviceId: thingName,
		timestamp: new Date(Date.now() - 11 * 60 * 1000).toISOString(),
		unresolved: false,
		position: {
			lng: 10.394017,
			lat: 63.417746,
			accuracy: 2000,
		},
		lte: {
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
		surveyId: randomUUID(),
		nw: state.roam.v.nw,
		deviceId: thingName,
		timestamp: new Date(Date.now() - 12 * 60 * 1000).toISOString(),
		unresolved: false,
		position: {
			accuracy: 91,
			lat: 63.437991506665405,
			lng: 10.627978535078947,
		},
		lte: {
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
		surveyId: randomUUID(),
		nw: state.roam.v.nw,
		deviceId: thingName,
		timestamp: new Date(Date.now() - 13 * 60 * 1000).toISOString(),
		unresolved: false,
		position: {
			accuracy: 886,
			lat: 63.41110757448426,
			lng: 10.792197897113734,
		},

		lte: {
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
		surveyId: randomUUID(),
		nw: state.roam.v.nw,
		deviceId: thingName,
		timestamp: new Date(Date.now() - 14 * 60 * 1000).toISOString(),
		unresolved: false,
		position: {
			accuracy: 1174,
			lat: 63.460714204378846,
			lng: 10.919885631033754,
		},
		lte: {
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
