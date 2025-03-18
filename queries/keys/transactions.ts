const transactionsKeys = {
	all: ["get-transactions"] as const,
	filters: () => [...transactionsKeys.all, "filter"] as const,
	filter: (filters: { month: number; year: number }) =>
		[...transactionsKeys.filters(), filters] as const,
};

export { transactionsKeys };
