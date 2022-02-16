import {
	AssetConfig,
	AssetInfo,
	Battery,
	Environment,
	GNSS,
	ReportedState,
	Roaming,
} from 'asset/asset'
import { validPassthrough } from 'utils/validPassthrough'

const validPassthroughRoam = validPassthrough(Roaming)
const validPassthroughGNSS = validPassthrough(GNSS)
const validPassthroughBattery = validPassthrough(Battery)
const validPassthroughEnvironment = validPassthrough(Environment)
const validPassthroughAssetConfig = validPassthrough(AssetConfig)
const validPassthroughAssetInfo = validPassthrough(AssetInfo)

/** Ensure that the asset's reported state is supported by this application */
export const toReported = (reported: ReportedState): ReportedState => {
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
