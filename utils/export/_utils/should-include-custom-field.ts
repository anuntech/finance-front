import type { CustomField } from "@/http/custom-fields/get";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { type QueryClient, useQueryClient } from "@tanstack/react-query";

interface ShouldIncludeCustomFieldProps {
	header: string;
	queryClient: QueryClient;
	transactionType: string;
}

export const shouldIncludeCustomField = ({
	header,
	queryClient,
	transactionType,
}: ShouldIncludeCustomFieldProps): boolean => {
	const customFields = queryClient.getQueryData<Array<CustomField>>(
		customFieldsKeys.all
	);

	if (!customFields.length) return true;

	const isCustomField = header.startsWith("CF-");

	if (!isCustomField) return true;

	const headerWithoutCF = header.replace("CF-", "");

	const customField = customFields.find(
		field => field.name === headerWithoutCF
	);

	if (!customField) return true; // Se não é um campo customizado, inclui

	if (customField.transactionType === TRANSACTION_TYPE.ALL) return true;

	if (!transactionType) return true; // Se não especificou tipo, inclui todos

	return customField.transactionType === transactionType;
};
