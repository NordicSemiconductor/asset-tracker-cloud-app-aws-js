import { DynamoDBClient } from '@aws-sdk/client-dynamodb'
import { IoTClient } from '@aws-sdk/client-iot'
import { IoTDataPlaneClient } from '@aws-sdk/client-iot-data-plane'
import { S3Client } from '@aws-sdk/client-s3'
import type { IoTService } from 'api/iot.js'
import { iotService } from 'api/iot.js'
import type { TimestreamService } from 'api/timestream.js'
import { timestreamService } from 'api/timestream.js'
import { useAppConfig } from 'hooks/useAppConfig.js'
import type { CredentialsAndIdentityId } from 'aws-amplify/auth'

import {
	createContext,
	useContext,
	useEffect,
	type FunctionComponent,
	type ReactNode,
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
	credentials: Required<CredentialsAndIdentityId>
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
			credentials: credentials.credentials,
			region,
		}),
		iotData: new IoTDataPlaneClient({
			credentials: credentials.credentials,
			endpoint: `https://${mqttEndpoint}`,
			region,
		}),
		s3: new S3Client({
			credentials: credentials.credentials,
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
					credentials: credentials.credentials,
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
