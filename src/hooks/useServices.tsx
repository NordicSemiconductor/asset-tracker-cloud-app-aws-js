import type { ICredentials } from '@aws-amplify/core'
import { IoTClient } from '@aws-sdk/client-iot'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import type { IoTService } from 'api/iot'
import { iotService } from 'api/iot'
import { useAppConfig } from 'hooks/useAppConfig'
import { createContext, FunctionComponent, useContext } from 'react'

export const ServicesContext = createContext<{
	iot: IoTService
}>({
	iot: undefined as any,
})

export const useServices = () => useContext(ServicesContext)

export const ServicesProvider: FunctionComponent<{
	credentials: ICredentials
}> = ({ children, credentials }) => {
	const { region, mqttEndpoint } = useAppConfig()

	return (
		<ServicesContext.Provider
			value={{
				iot: iotService({
					iot: new IoTClient({
						credentials,
						region,
					}),
					iotData: new IoTDataPlaneClient({
						credentials,
						endpoint: `https://${mqttEndpoint}`,
						region,
					}),
				}),
			}}
		>
			{children}
		</ServicesContext.Provider>
	)
}
