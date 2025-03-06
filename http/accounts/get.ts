import { api } from "@/libs/api";
import { getUrlWithMonthAndYear } from "@/utils/get-url-with-month-and-year";

export interface Account {
	id: string;
	name: string;
	balance: number;
	bankId: string;
}

interface GetAccountsProps {
	month?: number;
	year?: number;
}

export const getAccounts = async ({ month, year }: GetAccountsProps) => {
	try {
		const accountsUrl = getUrlWithMonthAndYear({
			url: "/account",
			month,
			year,
		});

		const response = await api.get<Array<Account>>(accountsUrl);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};

export const getAccountById = async (id: string) => {
	try {
		const response = await api.get<Account>(`/account/${id}`);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
