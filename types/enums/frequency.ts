export enum FREQUENCY {
	DO_NOT_REPEAT = "DO_NOT_REPEAT",
	RECURRING = "RECURRING",
	REPEAT = "REPEAT",
}

export const FREQUENCY_VALUES = Object.values(FREQUENCY) as [
	string,
	...string[],
];
