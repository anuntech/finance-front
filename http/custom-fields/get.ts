import { api } from "@/libs/api";
import type { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";

export interface CustomField {
	id: string;
	name: string;
	type: CUSTOM_FIELD_TYPE;
	options?: Array<string>;
	required?: boolean;
	transactionType: TRANSACTION_TYPE;
}

export const getCustomFields = async () => {
	try {
		const response = await api.get<Array<CustomField>>("/custom-field");

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
