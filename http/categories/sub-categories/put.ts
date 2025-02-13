import { api } from "@/libs/api";

interface SubCategory {
	id: string;
	name: string;
	icon: string;
}

interface UpdateSubCategory {
	recipeId: string;
	subCategory: SubCategory;
}

export const updateSubCategory = async (
	transaction: string,
	updateSubCategory: UpdateSubCategory
) => {
	try {
		const response = await api.put(`/${transaction}/sub-category`, {
			recipeId: updateSubCategory.recipeId,
			subCategory: {
				name: updateSubCategory.subCategory.name,
				icon: updateSubCategory.subCategory.icon,
			},
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
