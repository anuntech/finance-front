export enum INTERVAL {
	// DAILY = "DAILY",
	// WEEKLY = "WEEKLY",
	MONTHLY = "MONTHLY",
	QUARTERLY = "QUARTERLY",
	YEARLY = "YEARLY",
}

export const INTERVAL_VALUES = Object.values(INTERVAL) as [string, ...string[]];
