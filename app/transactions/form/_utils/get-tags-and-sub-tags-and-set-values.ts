import { type Category, getCategoryById } from "@/http/categories/get";
import type { TransactionWithTagsAndSubTags } from "@/http/transactions/get";
import type { ITransactionsForm } from "@/schemas/transactions";
import type { UseFormSetValue } from "react-hook-form";
import toast from "react-hot-toast";

interface GetTagsAndSubTagsAndSetValuesProps {
	transaction: TransactionWithTagsAndSubTags;
	tagsById: Array<Category>;
	setValue: UseFormSetValue<ITransactionsForm>;
}

export const getTagsAndSubTagsAndSetValues = async ({
	transaction,
	tagsById,
	setValue,
}: GetTagsAndSubTagsAndSetValuesProps) => {
	const tags: Array<{
		value: string;
		label: string;
		icon: string;
	}> = [];
	const subTags: Array<{
		tagId: string;
		value: string;
		label: string;
		icon: string;
	}> = [];

	for (const tag of transaction.tags) {
		const tagById = tagsById.find(tagById => tagById.id === tag.tagId);

		if (tag.subTagId === "000000000000000000000000") {
			const tagSelected = {
				value: tagById?.id,
				label: tagById?.name,
				icon: tagById?.icon,
			};

			tags.push(tagSelected);
		}

		if (tag.subTagId !== "000000000000000000000000") {
			const subTagById = tagById?.subCategories?.find(
				subCategory => tag.subTagId === subCategory.id
			);

			const subTagSelected = {
				tagId: tagById?.id,
				value: subTagById?.id,
				label: subTagById?.name,
				icon: subTagById?.icon,
			};

			subTags.push(subTagSelected);
		}
	}

	setValue("tags", tags || []);
	setValue("subTags", subTags || []);
};
