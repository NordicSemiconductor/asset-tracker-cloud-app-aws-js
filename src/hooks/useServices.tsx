import type { ICredentials } from '@aws-amplify/core'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { IoTClient } from '@aws-sdk/client-iot'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import type { IoTService } from 'api/iot'
import { iotService } from 'api/iot'
import { useAppConfig } from 'hooks/useAppConfig'
import { createContext, FunctionComponent, useContext, useEffect } from 'react'

export const ServicesContext = createContext<{
	iot: IoTService
	dynamoDB: DynamoDBClient
}>({
	iot: undefined as any,
	dynamoDB: undefined as any,
})

export const useServices = () => useContext(ServicesContext)

export const ServicesProvider: FunctionComponent<{
	credentials: ICredentials
}> = ({ children, credentials }) => {
	const { region, mqttEndpoint, userIotPolicyName } = useAppConfig()

	const iot = iotService({
		iot: new IoTClient({
			credentials,
			region,
		}),
		iotData: new IoTDataPlaneClient({
			credentials,
			endpoint: `https://${mqttEndpoint}`,
			region,
		}),
	})

	useEffect(() => {
		// This attaches the
		iot
			.attachIotPolicyToIdentity({
				policyName: userIotPolicyName,
				identityId: credentials.identityId,
			})
			.catch((err) => console.error(`[attachIotPolicyToIdentity]`, err))
	}, [credentials, iot, userIotPolicyName])

	return (
		<ServicesContext.Provider
			value={{
				iot,
				dynamoDB: new DynamoDBClient({
					credentials,
					region,
				}),
			}}
		>
			{children}
		</ServicesContext.Provider>
	)
}
