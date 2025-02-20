import { api } from "@/libs/api";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";

export interface SubCategory {
	id: string;
	name: string;
	icon: string;
	amount: number;
}

export interface Category {
	id: string;
	name: string;
	icon: string;
	amount: number;
	subCategories: Array<SubCategory>;
}

export const getCategories = async (transaction: CATEGORY_TYPE) => {
	try {
		console.log(transaction);

		const response = await api.get<Array<Category>>(
			`/category?type=${transaction}`
		);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};

export const getCategoryById = async (id: string) => {
	try {
		const response = await api.get<Category>(`/category/${id}`);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
