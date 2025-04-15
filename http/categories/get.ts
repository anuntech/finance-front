import { api } from "@/libs/api";
import type { CATEGORY_TYPE } from "@/types/enums/category-type";
import type { DATE_CONFIG } from "@/types/enums/date-config";
import type { DATE_TYPE } from "@/types/enums/date-type";
import { getUrlWithParams } from "@/utils/get-url-with-params";

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
	from?: Date;
	to?: Date;
	dateConfig?: DATE_CONFIG;
	dateType?: DATE_TYPE;
}

export const getCategories = async ({
	transaction,
	month,
	year,
	from,
	to,
	dateConfig,
	dateType,
}: GetCategoriesProps) => {
	try {
		const categoriesUrl = getUrlWithParams({
			url: `/category?type=${transaction}`,
			month,
			year,
			from,
			to,
			dateConfig,
		});

		const response = await api.get<Array<Category>>(categoriesUrl);

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};

export const getCategoryById = async (id: string) => {
	try {
		const response = await api.get<Category>(`/category/${id}`);

		return response.data;
	} catch (error) {
		console.error(error);

		throw {
			message: error.response.data.error,
		};
	}
};
