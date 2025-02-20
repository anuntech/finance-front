export enum TRANSACTION_TYPE {
	RECIPE = "RECIPE",
	EXPENSE = "EXPENSE",
}

export const TRANSACTION_TYPE_VALUES = Object.values(TRANSACTION_TYPE) as [
	string,
	...string[],
];
