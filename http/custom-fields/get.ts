import { api } from "@/libs/api";
import type { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";

export interface CustomField {
	id: string;
	name: string;
	type: CUSTOM_FIELD_TYPE;
	options?: Array<string>;
	required?: boolean;
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

export const getCustomFieldById = async (id: string) => {
	try {
		const response = await api.get<CustomField>(`/custom-field/${id}`);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
