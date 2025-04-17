import type { Column } from "@tanstack/react-table";

import { Checkbox } from "./ui/checkbox";

interface CheckboxWithFilterArrIncludesSomeProps<TData, TValue> {
	value: string;
	column: Column<TData, TValue>;
}

export const CheckboxWithFilterArrIncludesSome = <TData, TValue>({
	value,
	column,
}: CheckboxWithFilterArrIncludesSomeProps<TData, TValue>) => {
	return (
		<Checkbox
			id={value}
			checked={
				Array.isArray(column.getFilterValue()) &&
				(column.getFilterValue() as Array<string>).includes(value)
			}
			onCheckedChange={checked => {
				column.setFilterValue((old: Array<string>) => {
					const currentValues = Array.isArray(old) ? old : [];

					return checked
						? [...currentValues, value]
						: currentValues.filter(id => id !== value);
				});
			}}
		/>
	);
};
