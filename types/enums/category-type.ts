export enum CATEGORY_TYPE {
	RECIPE = "RECIPE",
	EXPENSE = "EXPENSE",
	TAG = "TAG",
}

export const CATEGORY_TYPE_VALUES = Object.values(CATEGORY_TYPE) as [
	string,
	...string[],
];
