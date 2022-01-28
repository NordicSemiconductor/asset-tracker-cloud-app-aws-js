import {
	DeleteThingCommand,
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

const defaultLimit = 10

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
}): Promise<{
	things: ThingAttribute[]
	nextStartKey?: string
}> => {
	const { things, nextToken } = await iot.send(
		new ListThingsCommand({
			nextToken: startKey,
			maxResults: limit ?? defaultLimit,
		}),
	)
	if (things === undefined)
		return { things: items ?? [], nextStartKey: startKey }
	const newItems = [...(items ?? []), ...filterTestThings(things ?? [])]
	if (nextToken === undefined || newItems.length >= (limit ?? defaultLimit))
		return { things: newItems, nextStartKey: nextToken }
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
	next?: () => void
	deleteThing: (thingName: string) => Promise<void>
}>({
	things: [],
	deleteThing: async () => Promise.resolve(),
})

export const useIot = () => useContext(IotContext)

export const IotProvider: FunctionComponent = ({ children }) => {
	const { credentials } = useAuth()
	const { region } = useAppConfig()
	const [things, setThings] = useState<Thing[]>([])
	const [nextStartKey, setNextStartKey] = useState<string>()
	const [fetching, setFetching] = useState<boolean>(false)

	const fetchPage = () => {
		if (credentials === undefined) return
		const iot = new IoTClient({
			credentials,
			region,
		})
		setFetching(true)
		fetchThingsPaginated({ iot, startKey: nextStartKey })
			.then(({ things, nextStartKey }) => {
				setThings((current) => [
					...current,
					...things.map((thing) => ({
						id: thing.thingName as string,
						name: (thing.attributes?.name ?? thing.thingName) as string,
					})),
				])
				setNextStartKey(nextStartKey)
			})
			.catch((err) => {
				console.error(err)
			})
			.finally(() => {
				setFetching(false)
			})
	}

	// load devices
	useEffect(() => {
		fetchPage()
	}, [fetchPage])

	return (
		<IotContext.Provider
			value={{
				things,
				next:
					nextStartKey !== undefined && !fetching
						? () => {
								fetchPage()
						  }
						: undefined,
				deleteThing: async (thingName) => {
					const iot = new IoTClient({
						credentials,
						region,
					})
					await iot.send(
						new DeleteThingCommand({
							thingName,
						}),
					)
				},
			}}
		>
			{children}
		</IotContext.Provider>
	)
}
