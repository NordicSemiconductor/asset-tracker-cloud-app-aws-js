import {
	IoTClient,
	ListThingsCommand,
	ThingAttribute,
} from '@aws-sdk/client-iot'
import { useAppConfig } from 'hooks/useAppConfig'
import { useAuth } from 'hooks/useAuth'
import {
	createContext,
	FunctionComponent,
	useContext,
	useEffect,
	useState,
} from 'react'

const filterTestThings = (things: ThingAttribute[]): ThingAttribute[] =>
	things.filter((thing) => thing.attributes?.test === undefined)

const fetchThingsPaginated = async ({
	iot,
	items,
	limit,
	startKey,
}: {
	iot: IoTClient
	items?: ThingAttribute[]
	limit?: number
	startKey?: string
}): Promise<ThingAttribute[]> => {
	const { things, nextToken } = await iot.send(
		new ListThingsCommand({
			nextToken: startKey,
		}),
	)
	if (things === undefined) return items ?? []
	const newItems = [...(items ?? []), ...filterTestThings(things ?? [])]
	if (nextToken === undefined) return newItems
	if (newItems.length > (limit ?? 100)) return newItems
	return fetchThingsPaginated({
		iot: iot,
		items: newItems,
		limit,
		startKey: nextToken,
	})
}

type Thing = { id: string; name: string }

export const IotContext = createContext<{
	things: Thing[]
}>({
	things: [],
})

export const useIot = () => useContext(IotContext)

export const IotProvider: FunctionComponent = ({ children }) => {
	const { credentials } = useAuth()
	const { region } = useAppConfig()
	const [things, setThings] = useState<Thing[]>([])

	// load devices
	useEffect(() => {
		if (credentials === undefined) return
		const iot = new IoTClient({
			credentials,
			region,
		})

		fetchThingsPaginated({ iot })
			.then((things) =>
				things.map((thing) => ({
					id: thing.thingName as string,
					name: (thing.attributes?.name ?? thing.thingName) as string,
				})),
			)
			.then(setThings)
			.catch(console.error)
	}, [credentials, region])

	return (
		<IotContext.Provider
			value={{
				things,
			}}
		>
			{children}
		</IotContext.Provider>
	)
}
