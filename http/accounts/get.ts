import { api } from "@/libs/api";

export interface Account {
	id: string;
	name: string;
	balance: number;
	bankId: string;
}

export const getAccounts = async () => {
	try {
		const response = await api.get<Array<Account>>("/account");

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
