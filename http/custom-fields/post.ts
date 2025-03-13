import { api } from "@/libs/api";
import type { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";

export interface CustomField {
	name: string;
	type: CUSTOM_FIELD_TYPE;
	required?: boolean;
	options?: Array<string>;
}

export const createCustomField = async (customField: CustomField) => {
	try {
		const response = await api.post("/custom-field", {
			name: customField.name,
			type: customField.type,
			required: customField.required,
			options: customField.options,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
