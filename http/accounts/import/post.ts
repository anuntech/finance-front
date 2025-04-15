import { api } from "@/libs/api";
import type { Account } from "../post";

export const importAccounts = async (accounts: Array<Account>) => {
	try {
		const response = await api.post("/account/import", {
			accounts,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
