import { api } from "@/libs/api";

interface SubCategory {
	id: string;
	name: string;
	icon: string;
}

interface UpdateSubCategory {
	categoryId: string;
	subCategory: SubCategory;
}

export const updateSubCategory = async (
	updateSubCategory: UpdateSubCategory
) => {
	try {
		const response = await api.put(
			`/category/sub-category/${updateSubCategory.categoryId}/${updateSubCategory.subCategory.id}`,
			{
				name: updateSubCategory.subCategory.name,
				icon: updateSubCategory.subCategory.icon,
			}
		);

		return response.data;
	} catch (error) {
		console.error(error);

		throw error;
	}
};
