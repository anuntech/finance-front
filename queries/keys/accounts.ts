const accountsKeys = {
	all: ["get-accounts"] as const,
	filters: () => [...accountsKeys.all, "filter"] as const,
	filter: (filters: { month: number; year: number }) =>
		[
			...accountsKeys.filters(),
			JSON.stringify({
				month: filters.month,
				year: filters.year,
			}),
		] as const,
	byIds: () => [...accountsKeys.all, "byId"] as const,
	byId: (id: string) => [...accountsKeys.byIds(), id] as const,
};

export { accountsKeys };
