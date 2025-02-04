import { api } from "@/libs/api";

export interface Account {
	id: string;
	name: string;
	icon: {
		name: string;
		color: string;
	};
	balance: number;
}

export const getAccounts = async () => {
	try {
		const response = await api.get<Array<Account>>("accounts");

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
