import { api } from "@/libs/api";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";
export interface Category {
	name: string;
	icon: string;
}

export const createCategory = async (
	transaction: CATEGORY_TYPE,
	category: Category
) => {
	try {
		const response = await api.post("/category", {
			type: transaction,
			name: category.name,
			icon: category.icon,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};

export interface CategoryWithType extends Category {
	type: string;
}

export const importCategories = async (categories: Array<CategoryWithType>) => {
	try {
		const response = await api.post("/category/import", {
			categories,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
