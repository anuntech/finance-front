import { CONFIGS } from "@/configs";
import { FREQUENCY } from "@/types/enums/frequency";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";
import { z } from "zod";

dayjs.locale(ptBR);

export const processValue = (value: unknown): unknown => {
	// Se for string vazia, retorna null
	if (value === "") {
		return null;
	}

	// Se for string, tenta converter de JSON
	if (typeof value === "string") {
		// Tenta identificar se é uma data ISO
		if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.*Z$/.test(value)) {
			return new Date(value);
		}

		// Tenta converter de JSON
		try {
			const parsed = JSON.parse(value);
			return parsed;
		} catch {
			// Se não for JSON válido, retorna o valor original
			return value;
		}
	}

	return value;
};

export interface TransactionValuesImported {
	accountId: string;
	assignedTo: string;
	// @ts-ignore: Ignorando erro de incompatibilidade com a assinatura de índice
	balance: {
		value: number;
		discount: number;
		discountPercentage: number;
		interest: number;
		interestPercentage: number;
	};
	categoryId: string;
	confirmationDate: string;
	description: string;
	dueDate: string;
	name: string;
	registrationDate: string;
	subCategoryId: string;
	supplier: string;
	tags: string;
	type: "Receita" | "Despesa";
	[key: string]: string | number;
}

interface ProcessValueWhenRouteIsTransactionsProps {
	values: Array<TransactionValuesImported>;
}

// ... existing code ...
const convertDataBRToISO = (dataBR: string, time?: string) => {
	const [day, month, year] = dataBR.split("/");
	const timeStr = time || CONFIGS.TIME.utc;

	return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}T${timeStr}Z`;
};

const emailSchema = z.string().email();
const dataSchema = z
	.string()
	.regex(
		/^\d{4}-(?:0[1-9]|1[0-2])-(?:0[1-9]|[12]\d|3[01])T(?:[01]\d|2[0-3]):[0-5]\d:[0-5]\dZ$/
	)
	.nullable();

export const processValueWhenRouteIsTransactions = ({
	values,
}: ProcessValueWhenRouteIsTransactionsProps) => {
	const newValues = [];

	for (const value of values) {
		const { tags, ...restValue } = value;

		const emailResult = emailSchema.safeParse(restValue.assignedTo);

		const balanceValue = restValue["balance.value"];
		const discount = restValue["balance.discount"];
		const discountPercentage = restValue["balance.discountPercentage"];
		const interest = restValue["balance.interest"];
		const interestPercentage = restValue["balance.interestPercentage"];

		if (!emailResult.success) throw new Error("Email inválido!");

		if (discount && discountPercentage)
			throw new Error("Selecione apenas um tipo de desconto!");

		if (interest && interestPercentage)
			throw new Error("Selecione apenas um tipo de juros!");

		if (restValue.type !== "Receita" && restValue.type !== "Despesa")
			throw new Error("Tipo inválido! Use Receita ou Despesa");

		const tagsArray = tags?.split(",") || [];
		const newTags = [];

		for (const tagFromTagsArray of tagsArray) {
			const [tag, subTag] = tagFromTagsArray?.split("-") || [];

			if (tag)
				newTags.push({
					tag: tag,
					subTag: subTag ?? "",
				});
		}

		const customFields = [];

		for (const key of Object.keys(restValue)) {
			if (key.startsWith("CF-")) {
				const keyWithoutCF = key.replace("CF-", "");

				customFields.push({
					customField: keyWithoutCF,
					value: String(restValue[key] ?? ""),
				});
			}
		}

		const dueDate = convertDataBRToISO(restValue.dueDate);
		const dueDateResult = dataSchema.safeParse(dueDate);

		if (!dueDateResult.success)
			throw new Error("Data de vencimento inválida! Use o formato DD/MM/YYYY");

		const confirmationDate = restValue.confirmationDate
			? convertDataBRToISO(restValue.confirmationDate)
			: null;
		const confirmationDateResult = dataSchema.safeParse(confirmationDate);

		if (!confirmationDateResult.success)
			throw new Error("Data de confirmação inválida! Use o formato DD/MM/YYYY");

		const registrationDate = convertDataBRToISO(restValue.registrationDate);
		const registrationDateResult = dataSchema.safeParse(registrationDate);

		if (!registrationDateResult.success)
			throw new Error("Data de registro inválida! Use o formato DD/MM/YYYY");

		const isConfirmed = !!confirmationDate;

		const newValue = {
			name: String(restValue.name),
			description: String(restValue.description),
			supplier: String(restValue.supplier),
			assignedTo: restValue.assignedTo,
			account: restValue.accountId,
			category: restValue.categoryId,
			subCategory: restValue.subCategoryId,
			type:
				restValue.type === "Receita"
					? TRANSACTION_TYPE.RECIPE
					: TRANSACTION_TYPE.EXPENSE,
			balance: {
				value: balanceValue,
				discount,
				discountPercentage,
				interest,
				interestPercentage,
			},
			dueDate,
			confirmationDate,
			registrationDate,
			tags: newTags,
			customFields,
			isConfirmed,
			frequency: FREQUENCY.DO_NOT_REPEAT,
		};

		newValues.push(newValue);
	}

	return newValues;
};
