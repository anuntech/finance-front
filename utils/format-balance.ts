export const formatBalance = (balance: number) => {
	const balanceFormatted = new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(balance);

	return balanceFormatted;
};
