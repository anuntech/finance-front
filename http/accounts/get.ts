import { api } from "@/libs/api";
import type { DATE_CONFIG } from "@/types/enums/date-config";
import type { DATE_TYPE } from "@/types/enums/date-type";
import { getUrlWithParams } from "@/utils/get-url-with-params";

export interface Account {
	id: string;
	name: string;
	currentBalance: number;
	balance: number;
	bankId: string;
}

interface GetAccountsProps {
	month?: number;
	year?: number;
	from?: Date;
	to?: Date;
	dateConfig?: DATE_CONFIG;
	dateType?: DATE_TYPE;
}

export const getAccounts = async ({
	month,
	year,
	from,
	to,
	dateConfig,
	dateType,
}: GetAccountsProps) => {
	try {
		const accountsUrl = getUrlWithParams({
			url: "/account",
			month,
			year,
			from,
			to,
			dateConfig,
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

		throw {
			message: error.response.data.error,
		};
	}
};
