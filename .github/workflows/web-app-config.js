import { DescribeEndpointCommand, IoTClient } from '@aws-sdk/client-iot'
import { GetParametersByPathCommand, SSMClient } from '@aws-sdk/client-ssm'
import { fromEnv } from '@nordicsemiconductor/from-env'
import { objectToEnv } from '@nordicsemiconductor/object-to-env'

const { stackName, region } = fromEnv({
	stackName: 'WEBAPP_STACK_NAME',
	region: 'AWS_REGION',
})(process.env)

const paginateParameters = async (parameters = [], startToken) => {
	const { Parameters, NextToken } = await new SSMClient({}).send(
		new GetParametersByPathCommand({
			Path,
			Recursive: true,
			NextToken: startToken,
		}),
	)
	if (Parameters.length > 0) parameters.push(...Parameters)
	if (NextToken !== undefined) return paginateParameters(parameters, NextToken)
	return parameters
}

const Path = `/${stackName}/config/stack`
const stackConfig = (await paginateParameters())
	.map(({ Name, ...rest }) => ({
		...rest,
		Name: Name?.replace(`${Path}/`, ''),
	}))
	.reduce(
		(settings, { Name, Value }) => ({
			...settings,
			[Name ?? '']: Value ?? '',
		}),
		{},
	)

const prefix = process.env.PREFIX ?? 'PUBLIC_'

console.log(
	objectToEnv(
		{
			...stackConfig,
			region,
			mqttEndpoint: (
				await new IoTClient({}).send(
					new DescribeEndpointCommand({ endpointType: 'iot:Data-ATS' }),
				)
			).endpointAddress,
		},
		{
			prefix,
			quote: '',
		},
	),
)
