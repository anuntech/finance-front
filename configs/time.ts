const now = new Date();
const hourInUTC = `${now.getUTCHours().toString().padStart(2, "0")}:${now.getUTCMinutes().toString().padStart(2, "0")}:${now.getUTCSeconds().toString().padStart(2, "0")}`;

export const TIME = {
	utc: hourInUTC,
} as const;
