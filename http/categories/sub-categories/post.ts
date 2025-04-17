import { api } from "@/libs/api";

interface SubCategory {
	name: string;
	icon: string;
}

interface CreateSubCategory {
	categoryId: string;
	subCategory: SubCategory;
}

export const createSubCategory = async (
	createSubCategory: CreateSubCategory
) => {
	try {
		const response = await api.post("/category/sub-category", {
			categoryId: createSubCategory.categoryId,
			subCategory: {
				name: createSubCategory.subCategory.name,
				icon: createSubCategory.subCategory.icon,
			},
		});

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
