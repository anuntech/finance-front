import type { ColumnDef, Table } from "@tanstack/react-table";

import type { QueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import {
	processValue,
	processValueWhenRouteIsAccounts,
	processValueWhenRouteIsTransactions,
} from "./_utils/process-value";
import { shouldIncludeCustomField } from "./_utils/should-include-custom-field";

interface Tag {
	tagId: string;
	subTagId: string;
}

interface ExportToExcelPropsBase<TData> {
	table: Table<TData>;
	columns: ColumnDef<TData>[];
	queryClient: QueryClient;
	pathname: string;
}

type ExportToExcelWithTransactionType<TData> = ExportToExcelPropsBase<TData> & {
	type?: "empty";
	transactionType: string;
};

type ExportToExcelWithOutTransactionType<TData> =
	ExportToExcelPropsBase<TData> & {
		type?: "full";
		transactionType?: never;
	};

type ExportToExcelProps<TData> =
	| ExportToExcelWithTransactionType<TData>
	| ExportToExcelWithOutTransactionType<TData>;

export function exportToExcel<TData>({
	table,
	columns,
	pathname,
	queryClient,
	transactionType,
	type = "full",
}: ExportToExcelProps<TData>) {
	const dataFull: Record<string, unknown>[] = [];
	const dataEmpty: Record<string, unknown>[] = [];

	if (type === "full") {
		// Obtém apenas as linhas selecionadas na tabela
		// Obtém apenas as linhas selecionadas na tabela
		const rows = table.getSelectedRowModel().rows;

		// Cria um array de objetos onde cada objeto representa uma linha para o Excel
		const data = rows.map(row => {
			// Cria um objeto vazio para armazenar os dados da linha atual
			const rowData: Record<string, string> = {};

			for (const cell of row.getAllCells()) {
				// Obtém o nome do cabeçalho da coluna ou string vazia se não for uma string
				const key =
					typeof cell.column.columnDef.header === "string"
						? cell.column.columnDef.header
						: "";

				if (key) {
					if (pathname === "/transactions") {
						processValueWhenRouteIsTransactions({
							headerName: key,
							value: cell.getValue() as
								| string
								| number
								| boolean
								| Date
								| Array<Tag>,
							rowData,
							queryClient,
						});
					} else if (pathname === "/config/accounts") {
						processValueWhenRouteIsAccounts({
							headerName: key,
							value: cell.getValue() as string | number,
							rowData,
							queryClient,
						});
					} else {
						rowData[key] = processValue(cell.getValue()) as string;
					}
				}
			}

			return rowData;
		});

		dataFull.push(...data);
	}

	if (type === "empty") {
		const headers = columns
			.filter(column => typeof column.header === "string")
			.map(column => column.header as string)
			.filter(header =>
				shouldIncludeCustomField({ header, queryClient, transactionType })
			);

		const data = headers.reduce(
			(acc, header) => {
				acc[header] = "";

				return acc;
			},
			{} as Record<string, string>
		);

		dataEmpty.push(data);
	}

	try {
		// Converte o array de objetos para uma planilha Excel
		const worksheet = XLSX.utils.json_to_sheet(
			type === "full" ? dataFull : dataEmpty
		);

		// Ajusta a largura das colunas
		const columnWidths = {};
		for (const row of type === "full" ? dataFull : dataEmpty) {
			for (const [key, value] of Object.entries(row)) {
				(columnWidths as Record<string, number>)[key] = Math.max(
					(columnWidths as Record<string, number>)[key] ?? 10,
					key.length,
					(value || "").toString().length
				);
			}
		}
		worksheet["!cols"] = Object.keys(columnWidths).map((key: string) => ({
			wch: (columnWidths as Record<string, number>)[key],
		}));

		// Cria um novo livro de trabalho Excel
		const workbook = XLSX.utils.book_new();

		// Adiciona a planilha ao livro com o nome "Dados"
		XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");

		// Salva o arquivo Excel
		XLSX.writeFile(
			workbook,
			`${type === "full" ? "dados_exportados" : "modelo_exportado"}.xlsx`
		);
	} catch (error) {
		console.error("Erro ao gerar Excel:", error);
		throw error;
	}
}
