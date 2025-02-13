import { api } from "@/libs/api";

interface SubCategory {
	name: string;
	icon: string;
}

interface CreateSubCategory {
	recipeId: string;
	subCategory: SubCategory;
}

export const createSubCategory = async (
	transaction: string,
	createSubCategory: CreateSubCategory
) => {
	try {
		const response = await api.post(`/${transaction}/sub-category`, {
			recipeId: createSubCategory.recipeId,
			subCategory: {
				name: createSubCategory.subCategory.name,
				icon: createSubCategory.subCategory.icon,
			},
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
