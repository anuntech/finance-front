export const formatBalance = (balance: number) => {
	const balanceParsed = Number.parseFloat(String(balance));
	const balanceFormatted = new Intl.NumberFormat("pt-BR", {
		style: "currency",
		currency: "BRL",
	}).format(balanceParsed);

	return balanceFormatted;
};
