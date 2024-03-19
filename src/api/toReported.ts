import {
	AWSDevice,
	Battery,
	Config,
	Environment,
	GNSS,
	RoamingInfo,
	type AWSReportedData,
} from '@nordicsemiconductor/asset-tracker-cloud-docs/protocol'
import { validPassthrough } from 'utils/validPassthrough.js'

const validPassthroughRoam = validPassthrough(RoamingInfo)
const validPassthroughGNSS = validPassthrough(GNSS)
const validPassthroughBattery = validPassthrough(Battery)
const validPassthroughEnvironment = validPassthrough(Environment)
const validPassthroughAssetConfig = validPassthrough(Config)
const validPassthroughAssetInfo = validPassthrough(AWSDevice)

/** Ensure that the asset's reported state is supported by this application */
export const toReported = (reported: AWSReportedData): AWSReportedData => {
	if (reported.roam !== undefined) {
		reported.roam = validPassthroughRoam(reported.roam)
	}
	if (reported.gnss !== undefined) {
		reported.gnss = validPassthroughGNSS(reported.gnss)
	}
	if (reported.bat !== undefined) {
		reported.bat = validPassthroughBattery(reported.bat)
	}
	if (reported.dev !== undefined) {
		reported.dev = validPassthroughAssetInfo(reported.dev)
	}
	if (reported.env !== undefined) {
		reported.env = validPassthroughEnvironment(reported.env)
	}
	if (reported.cfg !== undefined) {
		reported.cfg = validPassthroughAssetConfig(reported.cfg)
	}
	return reported
}
