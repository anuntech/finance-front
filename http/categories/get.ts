import { api } from "@/libs/api";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";
import { getUrlWithMonthAndYearAndDateType } from "@/utils/get-url-with-month-and-year-and-date-type";

export interface SubCategory {
	id: string;
	icon: string;
	name: string;
	currentAmount: number;
	amount: number;
}

export interface Category {
	id: string;
	name: string;
	icon: string;
	currentAmount: number;
	amount: number;
	subCategories: Array<SubCategory>;
}

interface GetCategoriesProps {
	transaction: CATEGORY_TYPE;
	month?: number;
	year?: number;
}

export const getCategories = async ({
	transaction,
	month,
	year,
}: GetCategoriesProps) => {
	try {
		const categoriesUrl = getUrlWithMonthAndYearAndDateType({
			url: `/category?type=${transaction}`,
			month,
			year,
		});

		const response = await api.get<Array<Category>>(categoriesUrl);

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
