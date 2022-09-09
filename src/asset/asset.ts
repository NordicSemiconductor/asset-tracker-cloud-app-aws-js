import { Static, Type } from '@sinclair/typebox'

export type Asset = { id: string; name: string; version: number }
export type AssetWithTwin = {
	asset: Asset
	twin: AssetTwin
}

export enum DataModules {
	GNSS = 'gnss',
	NeigboringCellMeasurements = 'ncell',
}

/** @see https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/eb5e212ecb15ad52ae891162085af02f7b244d9a/docs/cloud-protocol/cfg.schema.json */
export const AssetConfig = Type.Object(
	{
		act: Type.Boolean({
			description: 'Whether to enable the active mode.',
			examples: [false],
		}),
		actwt: Type.Integer({
			description:
				'In active mode: Wait this amount of seconds until sending the next update. The actual interval will be this time plus the time it takes to get a GNSS fix.',
			minimum: 1,
			maximum: 2147483647,
			examples: [300],
		}),
		mvres: Type.Integer({
			description:
				'(movement resolution) In passive mode: After detecting movement send an update and wait this amount of time until movement again can trigger the next update.',
			minimum: 1,
			maximum: 2147483647,
			examples: [300],
		}),
		mvt: Type.Integer({
			description:
				'(movement timeout) In passive mode: Send update at least this often (in seconds).',
			minimum: 1,
			maximum: 2147483647,
			examples: [3600],
		}),
		gnsst: Type.Integer({
			description: 'GNSS timeout (in seconds): Timeout for GNSS fix.',
			minimum: 1,
			maximum: 2147483647,
			examples: [60],
		}),
		accath: Type.Number({
			description:
				'Accelerometer Activity Threshold in m/s²: Minimal absolute value for an accelerometer reading to be considered movement.',
			minimum: 0,
			maximum: 78.4532,
			examples: [10],
		}),
		accith: Type.Number({
			description:
				'Accelerometer inactivity threshold in m/s²: Maximum absolute value for an accelerometer reading to be considered stillness. Should be lower than the activity threshold.',
			minimum: 0,
			maximum: 78.4532,
			examples: [5],
		}),
		accito: Type.Number({
			description:
				'Accelerometer inactivity timeout in s: Hysteresis timeout for stillness detection.',
			minimum: 0.08,
			maximum: 5242.88,
			examples: [60],
		}),
		nod: Type.Array(Type.Enum(DataModules), {
			minItems: 0,
			description:
				'List of modules which should be disabled when sampling data.',
		}),
	},
	{ description: 'Configures the device' },
)

export type AssetState = {
	cfg?: Static<typeof AssetConfig>
}

export type UnixTimeInSeconds = number
export type UnixTimeInMilliseconds = number

export type ReportedState = AssetState & {
	gnss?: Static<typeof GNSS>
	bat?: Static<typeof Battery>
	dev?: Static<typeof AssetInfo>
	roam?: Static<typeof Roaming>
	env?: Static<typeof Environment>
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

const ts = Type.Integer({
	minimum: 1234567890123,
	description: 'Timestamp as Unix epoch with millisecond precision (UTC)',
	examples: [1584533788029],
})
const lng = Type.Number({
	description: 'Longitude',
	minimum: -180,
	maximum: 180,
})
const lat = Type.Number({
	description: 'Latitude',
	minimum: -90,
	maximum: 90,
})
const acc = Type.Number({
	description: 'Accuracy (2D 1-sigma) in meters',
	minimum: 0,
})

/**
 * @see https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/eb5e212ecb15ad52ae891162085af02f7b244d9a/docs/cloud-protocol/messages.schema.json
 */
export const Button = Type.Object(
	{
		v: Type.Number({
			description: 'ID of the button',
			minimum: 1,
			examples: [1],
		}),
		ts,
	},
	{ description: 'The number and the time a button was pushed' },
)

/**
 * @see https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/eb5e212ecb15ad52ae891162085af02f7b244d9a/docs/cloud-protocol/state.reported.schema.json
 */
export const Battery = Type.Object(
	{
		v: Type.Number({
			description: 'Battery reading read by the modem',
			minimum: 1,
		}),
		ts,
	},
	{ description: 'Battery reading in millivolt' },
)

/**
 * @see https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/eb5e212ecb15ad52ae891162085af02f7b244d9a/docs/cloud-protocol/state.reported.schema.json
 */
export const Environment = Type.Object(
	{
		v: Type.Object(
			{
				temp: Type.Number({
					description: 'Temperature reading from external sensor',
				}),
				hum: Type.Number({
					description: 'Humidity reading from external sensor',
					minimum: 1,
					maximum: 100,
				}),
				atmp: Type.Number({
					description:
						'Atmospheric pressure reading from external sensor in kPa',
					minimum: 0,
				}),
			},
			{ description: 'The individual sensor readings' },
		),
		ts,
	},
	{ description: 'Environment sensor readings' },
)

/**
 * @see https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/eb5e212ecb15ad52ae891162085af02f7b244d9a/docs/cloud-protocol/state.reported.schema.json
 */
export const GNSS = Type.Object(
	{
		v: Type.Object({
			lng,
			lat,
			acc,
			alt: Type.Number({
				description: 'Altitude above WGS-84 ellipsoid in meters',
			}),
			spd: Type.Number({
				description: 'Horizontal speed in meters',
				minimum: 0,
			}),
			hdg: Type.Number({
				description: 'Heading of movement in degrees',
				minimum: 0,
				maximum: 360,
			}),
		}),
		ts,
	},
	{ description: 'Timestamp as Unix epoch with millisecond precision (UTC)' },
)

/**
 * @see https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/eb5e212ecb15ad52ae891162085af02f7b244d9a/docs/cloud-protocol/state.reported.schema.json
 */
export const Roaming = Type.Object(
	{
		v: Type.Object({
			band: Type.Integer({ minimum: 1, description: 'Band', examples: [3] }),
			nw: Type.String({
				minLength: 1,
				description: 'Network mode',
				examples: ['LTE-M', 'NB-IoT'],
			}),
			rsrp: Type.Integer({
				description:
					'Reference Signal Received Power (RSRP). The average power level in dBm received from a single reference signal in an LTE (Long-term Evolution) network. Typically this value ranges from -140 to -40 dBm.',
				minimum: -140,
				maximum: -40,
				examples: [-97, -104],
			}),
			area: Type.Integer({
				description: 'Area code.',
				minimum: 1,
				examples: [12],
			}),
			mccmnc: Type.Integer({
				description: 'Mobile country code and mobile network code',
				minimum: 10000,
				maximum: 99999,
				examples: [24202],
			}),
			cell: Type.Integer({
				description: 'Cell id',
				minimum: 1,
				examples: [33703719],
			}),
			ip: Type.String({
				description: 'IP address',
				minLength: 1,
				examples: [
					'10.81.183.99',
					'2001:0db8:85a3:0000:0000:8a2e:0370:7334',
					'2001:db8:85a3::8a2e:370:7334',
				],
			}),
		}),
		ts,
	},
	{
		description:
			'Roaming information. This information shall be updated by the device every time it publishes primary application data. It is considered low-priority information so it should always be sent after the primary application data has been published.',
	},
)

/**
 * @see https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/eb5e212ecb15ad52ae891162085af02f7b244d9a/docs/cloud-protocol/state.reported.schema.json
 */
export const AssetInfo = Type.Object(
	{
		v: Type.Object({
			imei: Type.String({
				description: 'Board IMEI',
				minLength: 15,
				maxLength: 16,
				examples: ['352656106111232'],
			}),
			iccid: Type.String({
				description: 'SIM ICCID',
				minLength: 19,
				maxLength: 20,
				examples: ['89450421180216216095'],
			}),
			modV: Type.String({
				description: 'Modem Firmware Version',
				minLength: 1,
				examples: ['mfw_nrf9160_1.0.0'],
			}),
			brdV: Type.String({
				description: 'Board Version',
				minLength: 1,
				examples: ['thingy91_nrf9160'],
			}),
			// https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/eb5e212ecb15ad52ae891162085af02f7b244d9a/docs/cloud-protocol/state.reported.aws.schema.json
			appV: Type.String({
				description: 'Application Firmware Version',
				minLength: 1,
				examples: ['v1.0.0-rc1-327-g6fc8c16b239f'],
			}),
		}),
		ts,
	},
	{
		description:
			'Static device information. This information shall be updated by the device once after reboot.',
	},
)

/**
 * Combines the report with more data from the backend.
 *
 * @see https://github.com/NordicSemiconductor/asset-tracker-cloud-docs/blob/eb5e212ecb15ad52ae891162085af02f7b244d9a/docs/cloud-protocol/ncellmeas.schema.json
 */
export const NCellMeasReport = Type.Object(
	{
		reportId: Type.String({
			minLength: 1,
			description: 'The report ID',
		}),
		nw: Type.String({
			minLength: 1,
			description: 'Network mode',
			examples: ['LTE-M', 'NB-IoT'],
		}),
		deviceId: Type.String({
			minLength: 1,
			description: 'The device ID',
		}),
		report: Type.Object(
			{
				mcc: Type.Integer({
					description:
						'Mobile country code. In contrast to roaming information (which uses the Modem Information data), neighboring cell measurement reports contain mcc and mnc as separate integers, instead of a string.',
					minimum: 100,
					maximum: 999,
					examples: [242],
				}),
				mnc: Type.Integer({
					description: 'Mobile network code.',
					minimum: 0,
					maximum: 99,
					examples: [2],
				}),
				cell: Type.Integer({
					description:
						'The cell ID the User Equipment (UE) is camped on. 4-byte Evolved Terrestrial Radio Access Network (E-UTRAN) cell ID.',
					minimum: 1,
					examples: [33703719],
				}),
				area: Type.Integer({
					description: 'Area code.',
					minimum: 1,
					examples: [12],
				}),
				rsrp: Type.Number({
					description:
						'Reference Signal Received Power (RSRP). The average power level in dBm received from a single reference signal in an LTE (Long-term Evolution) network. Typically this value ranges from -140 to -40 dBm. ',
					minimum: -199,
					maximum: 0,
					examples: [-97, -104],
				}),
				rsrq: Type.Number({
					description:
						'Reference Signals Received Quality (RSRQ) of the current cell. Typically this value ranges from -19.5 to −3 dBm.',
					minimum: -99,
					maximum: 0,
					examples: [-11, -18],
				}),
				earfcn: Type.Integer({
					description:
						'E-UTRA Absolute Radio Frequency Channel Number (EARFCN) of the current cell where the EARFCN is as defined in 3GPP TS 36.101. LTE carrier channel number for unique identification of LTE band and carrier frequency.',
					minimum: 1,
					examples: [262143],
				}),
				adv: Type.Integer({
					description:
						'Timing advance value (Ts). Time units as specified in 3GPP TS 36.211. (0–20512: When timing advance is valid, 65535: When timing advance is not valid)',
					minimum: 0,
					maximum: 65535,
					examples: [80],
				}),
				nmr: Type.Array(
					Type.Object({
						earfcn: Type.Integer({
							description:
								'E-UTRA Absolute Radio Frequency Channel Number (EARFCN) of the current cell where the EARFCN is as defined in 3GPP TS 36.101. LTE carrier channel number for unique identification of LTE band and carrier frequency.',
							minimum: 1,
							examples: [262143],
						}),
						cell: Type.Integer({
							description: 'Physical cell ID of the neighboring cell.',
							minimum: 1,
							examples: [33703719],
						}),
						rsrp: Type.Number({
							description:
								'Reference Signal Received Power (RSRP). The average power level in dBm received from a single reference signal in an LTE (Long-term Evolution) network. Typically this value ranges from -140 to -40 dBm. ',
							minimum: -199,
							maximum: 0,
							examples: [-97, -104],
						}),
						rsrq: Type.Number({
							description:
								'Reference Signals Received Quality (RSRQ) of the current cell. Typically this value ranges from -19.5 to −3 dBm.',
							minimum: -99,
							maximum: 0,
							examples: [-11, -18],
						}),
					}),
					{ description: 'The neighboring cells', minItems: 1 },
				),
				ts,
			},
			{
				description:
					'Describes the format which is used by the device to report neighboring cell measurements. The report is produced by the %NCELLMEAS AT command. See https://infocenter.nordicsemi.com/topic/ref_at_commands/REF/at_commands/mob_termination_ctrl_status/ncellmeas.html',
			},
		),
		timestamp: Type.String({
			description:
				'Timestamp as RFC3339 string (so it can be used as a sort column in DynamoDB)',
			examples: ['2022-03-03T14:45:45.555Z'],
			pattern:
				'^2[0-9]{3}-[01][0-9]-[0-3][0-9]T[0-2][0-9]:[0-5][0-9]:[0-5][0-9](.[0-9]+)',
		}),
		unresolved: Type.Optional(
			Type.Boolean({
				description: 'whether the report has been resolved',
			}),
		),
		lat: Type.Optional(lat),
		lng: Type.Optional(lng),
		accuracy: Type.Optional(acc),
	},
	{
		description:
			'Describes the neighboring cell measurement report as it is stored in DynamoDB.',
	},
)

export enum SensorProperties {
	Battery = 'bat',
	Environment = 'env',
	GNSS = 'gnss',
	Roaming = 'roam',
	Asset = 'dev',
	Button = 'btn',
	Impact = 'impact',
}
