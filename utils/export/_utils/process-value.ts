import type { Account } from "@/http/accounts/get";
import type { Bank } from "@/http/banks/get";
import type { Category } from "@/http/categories/get";
import type { Member } from "@/http/workspace/members/get";
import type { Owner } from "@/http/workspace/owner/get";
import { accountsKeys } from "@/queries/keys/accounts";
import { banksKeys } from "@/queries/keys/banks";
import { categoriesKeys } from "@/queries/keys/categories";
import { membersKeys } from "@/queries/keys/members";
import { ownerKeys } from "@/queries/keys/owner";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { QueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";

dayjs.locale(ptBR);

// Função auxiliar para processar valores complexos
export const processValue = (value: unknown): string | number | boolean => {
	if (value === null || value === undefined) {
		return "";
	}

	if (typeof value === "object") {
		// Se for um objeto Date, retorna a string formatada
		if (value instanceof Date) {
			return value.toISOString();
		}
		// Para outros objetos, converte em JSON string
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	}

	return String(value);
};

interface Tag {
	tagId: string;
	subTagId: string;
}

interface ProcessValuesWhenRouteIsTransactionsProps {
	headerName: string;
	rowData: Record<string, unknown>;
	value: string | number | boolean | Date | Array<Tag>;
	queryClient: QueryClient;
}

interface ProcessValuesWhenRouteIsAccountsProps {
	headerName: string;
	rowData: Record<string, unknown>;
	value: string | number;
	queryClient: QueryClient;
}

export const processValueWhenRouteIsAccounts = ({
	headerName,
	value,
	rowData,
	queryClient,
}: ProcessValuesWhenRouteIsAccountsProps) => {
	switch (headerName) {
		case "Banco": {
			const banks = queryClient.getQueryData(banksKeys.all) as Array<Bank>;

			const bank = banks.find(bank => bank.id === value);

			if (bank) rowData[headerName] = bank.name;

			break;
		}
		default:
			// Processa o valor antes de adicionar ao rowData
			rowData[headerName] = processValue(value);
	}
};

export const processValueWhenRouteIsTransactions = ({
	headerName,
	value,
	rowData,
	queryClient,
}: ProcessValuesWhenRouteIsTransactionsProps) => {
	switch (headerName) {
		case "Tipo":
			if (value === TRANSACTION_TYPE.RECIPE) {
				rowData[headerName] = "Receita";
			}

			if (value === TRANSACTION_TYPE.EXPENSE) {
				rowData[headerName] = "Despesa";
			}

			break;
		case "Conta": {
			const account: Account | undefined = queryClient.getQueryData(
				accountsKeys.byId(value as string)
			);

			if (account) rowData[headerName] = account.name;

			break;
		}
		case "Atribuído a": {
			const owner: Owner | undefined = queryClient.getQueryData(ownerKeys.all);
			const members = (
				queryClient.getQueryData(membersKeys.all) as Array<Member> | undefined
			)?.map(member => ({
				...member,
				id: member._id,
			}));

			const users = [owner, ...members];

			const user = users?.find(user => user.id === value);

			if (user) rowData[headerName] = user.email;

			break;
		}
		case "Competência":
		case "Vencimento":
		case "Confirmação": {
			const formattedDate = dayjs(value as Date).format("DD/MM/YYYY");

			rowData[headerName] = formattedDate;

			break;
		}
		case "Subcategoria": {
			const tipo = rowData.Tipo as "Receita" | "Despesa";
			const type =
				tipo === "Receita" ? TRANSACTION_TYPE.RECIPE : TRANSACTION_TYPE.EXPENSE;

			const categoryId = rowData.Categoria as string;

			if (!categoryId) break;

			const category: Category | undefined = queryClient.getQueryData(
				categoriesKeys(type).byId(categoryId as string)
			);

			if (!category) break;

			rowData.Categoria = category.name;

			const subCategory = category.subCategories?.find(
				subCategory => subCategory.id === value
			);

			if (subCategory) rowData[headerName] = subCategory.name;

			break;
		}
		case "Etiquetas": {
			const nameTags: Array<string> = [];

			const tags = value as Array<Tag>;

			for (const tag of tags) {
				const category: Category | undefined = queryClient.getQueryData(
					categoriesKeys(CATEGORY_TYPE.TAG).byId(tag.tagId)
				);

				if (!category) break;

				const nameTag = category.name;

				if (tag.subTagId === "000000000000000000000000") nameTags.push(nameTag);

				const subCategory = category.subCategories.find(
					subCategory => subCategory.id === tag.subTagId
				);

				if (subCategory) nameTags.push(`${category.name}-${subCategory.name}`);
			}

			rowData[headerName] = nameTags.join(",");

			break;
		}
		case "Sub etiquetas": {
			break;
		}
		case "Status": {
			const tipo = rowData.Tipo as "Receita" | "Despesa";
			const type =
				tipo === "Receita" ? TRANSACTION_TYPE.RECIPE : TRANSACTION_TYPE.EXPENSE;

			switch (type) {
				case TRANSACTION_TYPE.RECIPE:
					switch (value as boolean) {
						case true:
							rowData[headerName] = "Recebida";

							break;
						case false:
							rowData[headerName] = "Não recebida";

							break;
					}
					break;
				case TRANSACTION_TYPE.EXPENSE:
					switch (value as boolean) {
						case true:
							rowData[headerName] = "Paga";

							break;
						case false:
							rowData[headerName] = "Não paga";

							break;
					}
			}

			break;
		}
		default:
			// Processa o valor antes de adicionar ao rowData
			rowData[headerName] = processValue(value);
	}
};
