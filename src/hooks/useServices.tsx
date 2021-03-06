import type { ICredentials } from '@aws-amplify/core'
import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { IoTClient } from '@aws-sdk/client-iot'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { S3Client } from '@aws-sdk/client-s3'
import type { IoTService } from 'api/iot'
import { iotService } from 'api/iot'
import type { TimestreamService } from 'api/timestream'
import { timestreamService } from 'api/timestream'
import { useAppConfig } from 'hooks/useAppConfig'
import {
	createContext,
	FunctionComponent,
	ReactNode,
	useContext,
	useEffect,
} from 'react'

export const ServicesContext = createContext<{
	iot: IoTService
	dynamoDB: DynamoDBClient
	timestream: TimestreamService
}>({
	iot: undefined as any,
	dynamoDB: undefined as any,
	timestream: undefined as any,
})

export const useServices = () => useContext(ServicesContext)

export const ServicesProvider: FunctionComponent<{
	credentials: ICredentials
	children: ReactNode
}> = ({ children, credentials }) => {
	const {
		region,
		mqttEndpoint,
		userIotPolicyName,
		timestream: { db, table },
		fotaBucketName,
	} = useAppConfig()

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
		s3: new S3Client({
			credentials,
			region,
		}),
		fotaBucketName,
	})

	useEffect(() => {
		// This attaches the neccessary IoT policy to the user
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
				timestream: timestreamService({
					credentials,
					region,
					db,
					table,
				}),
			}}
		>
			{children}
		</ServicesContext.Provider>
	)
}
