import type { DeviceUpgradeFirmwareJob } from 'api/iot/createFirmwareJob'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAsset } from 'hooks/useAsset'
import { useServices } from 'hooks/useServices'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
	useState,
} from 'react'
import { ulid } from 'utils/ulid'

export const FOTAContext = createContext<{
	jobs: DeviceUpgradeFirmwareJob[]
	reload: () => void
	nonce: string
	enableAutoUpdate: () => void
	disableAutoUpdate: () => void
}>({
	jobs: [],
	reload: () => undefined,
	nonce: ulid(),
	enableAutoUpdate: () => undefined,
	disableAutoUpdate: () => undefined,
})

export const useFOTA = () => useContext(FOTAContext)

export const FOTAProvider: FunctionComponent<{ children: ReactNode }> = ({
	children,
}) => {
	const { iot } = useServices()
	const [jobs, setJobs] = useState<DeviceUpgradeFirmwareJob[]>([])
	const { asset } = useAsset()
	const [nonce, setNonce] = useState<string>(ulid())
	const [autoUpdateListeners, setAutoUpdateListeners] = useState<number>(0)
	const { autoUpdateIntervalInSeconds } = useAppConfig()

	// Fetch jobs
	useEffect(() => {
		let isMounted = true
		if (asset === undefined) return

		iot
			.listJobs(asset.id)
			.then((jobs) => {
				if (!isMounted) {
					return
				}
				setJobs(jobs)
			})
			.catch((err) => {
				console.error('[useFOTA]', err)
			})

		return () => {
			isMounted = false
		}
	}, [asset, nonce, iot])

	// Auto-update the job list
	useEffect(() => {
		let isMounted = true
		if (asset === undefined) return
		if (autoUpdateListeners <= 0) return

		const updateJobs = async () =>
			iot
				.listJobs(asset.id)
				.then((jobs) => {
					if (!isMounted) {
						return
					}
					setJobs(jobs)
				})
				.catch((err) => {
					console.error('[useFOTA]', err)
				})

		console.debug(`[autoUpdateJobs]`, 'enabled', autoUpdateIntervalInSeconds)
		const interval = setInterval(updateJobs, autoUpdateIntervalInSeconds * 1000)
		return () => {
			console.debug(`[autoUpdateJobs]`, 'disabled')
			clearInterval(interval)
			isMounted = false
		}
	}, [asset, iot, autoUpdateListeners, autoUpdateIntervalInSeconds])

	return (
		<FOTAContext.Provider
			value={{
				jobs,
				reload: () => {
					setTimeout(() => {
						setNonce(ulid())
					}, 1000)
				},
				nonce,
				enableAutoUpdate: () => {
					setAutoUpdateListeners((listeners) => listeners + 1)
				},
				disableAutoUpdate: () => {
					setAutoUpdateListeners((listeners) => listeners - 1)
				},
			}}
		>
			{children}
		</FOTAContext.Provider>
	)
}
