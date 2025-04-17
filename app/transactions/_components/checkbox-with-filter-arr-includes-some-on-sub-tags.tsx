import type { Column } from "@tanstack/react-table";
import { Checkbox } from "../../../components/ui/checkbox";

interface Tag {
	tagId: string;
	subTagId: string;
}

interface CheckboxWithFilterArrIncludesSomeOnSubTagsProps<TData, TValue> {
	value: string;
	tagId: string;
	column: Column<TData, TValue>;
}

export const CheckboxWithFilterArrIncludesSomeOnSubTags = <TData, TValue>({
	value,
	tagId,
	column,
}: CheckboxWithFilterArrIncludesSomeOnSubTagsProps<TData, TValue>) => {
	return (
		<Checkbox
			id={`${tagId}-${value}`}
			checked={
				Array.isArray(column.getFilterValue()) &&
				(column.getFilterValue() as Array<Tag>).some(
					filter => filter.tagId === tagId && filter.subTagId === value
				)
			}
			onCheckedChange={checked => {
				column.setFilterValue((old: Array<Tag>) => {
					const currentValues = Array.isArray(old) ? old : [];

					return checked
						? [...currentValues, { tagId, subTagId: value }]
						: currentValues.filter(
								filter => !(filter.tagId === tagId && filter.subTagId === value)
							);
				});
			}}
		/>
	);
};
