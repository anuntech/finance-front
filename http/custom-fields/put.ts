import { api } from "@/libs/api";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";

export interface CustomField {
	id: string;
	name: string;
	type: string;
	required: boolean;
	options?: Array<string>;
	transactionType: TRANSACTION_TYPE;
}

export const updateCustomField = async (customField: CustomField) => {
	try {
		const response = await api.put(`/custom-field/${customField.id}`, {
			id: customField.id,
			name: customField.name,
			type: customField.type,
			required: customField.required,
			options: customField.options,
			transactionType: customField.transactionType,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
