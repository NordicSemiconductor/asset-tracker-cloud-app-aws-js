export type PaginatedResult<A> = {
	items: A[]
	nextStartKey?: any
}

/**
 * Recursively follows paginated results and concatenates the result into one array.
 * NOTE: This method has no upper runtime limit and may time out.
 */
export const paginate = async <A>({
	paginator,
	startKey,
	items,
}: {
	paginator: (startKey?: any) => Promise<PaginatedResult<A>>
	startKey?: any
	items?: A[]
}): Promise<A[]> => {
	const page = await paginator(startKey)
	const i = [...(items !== undefined ? items : []), ...page.items]
	if (page.nextStartKey !== undefined && page.nextStartKey !== null) {
		await paginate({
			paginator,
			startKey: page.nextStartKey,
			items: i,
		})
	}
	return i
}
