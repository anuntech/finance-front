import { api } from "@/libs/api";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";
import type { Category } from "../post";

export interface CategoryWithType extends Category {
	type: CATEGORY_TYPE;
}

export const importCategories = async (categories: Array<CategoryWithType>) => {
	try {
		const response = await api.post("/category/import", {
			categories,
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
