import type { CustomField } from "@/http/custom-fields/get";
import type { Transaction } from "@/http/transactions/get";
import type { ITransactionsForm } from "@/schemas/transactions";
import type { UseFormSetValue } from "react-hook-form";

interface GetCustomFieldProps {
	transaction: Transaction;
	customFields: Array<CustomField>;
	setValue: UseFormSetValue<ITransactionsForm>;
}

export const getCustomField = ({
	transaction,
	customFields,
	setValue,
}: GetCustomFieldProps) => {
	const customField = transaction.customFields?.reduce(
		(obj, item) => {
			const currentCustomField = customFields?.find(
				customField => customField.id === item.id
			);

			if (currentCustomField) {
				obj[item.id] = {
					fieldValue: item.value,
					required: currentCustomField?.required,
				};
			}

			return obj;
		},
		{} as Record<string, { fieldValue: string | number; required?: boolean }>
	);

	setValue("customField", customField);
};
