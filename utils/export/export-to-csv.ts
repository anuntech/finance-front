import type { QueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import Papa from "papaparse";
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

interface ExportToCSVPropsBase<TData> {
	table: Table<TData>;
	columns: ColumnDef<TData>[];
	queryClient: QueryClient;
	pathname: string;
}

type ExportToCSVWithTransactionType<TData> = ExportToCSVPropsBase<TData> & {
	type?: "empty";
	transactionType: string;
};

type ExportToCSVWithOutTransactionType<TData> = ExportToCSVPropsBase<TData> & {
	type?: "full";
	transactionType?: never;
};

type ExportToCSVProps<TData> =
	| ExportToCSVWithTransactionType<TData>
	| ExportToCSVWithOutTransactionType<TData>;

// Função para exportar dados selecionados de uma tabela para arquivo CSV
export const exportToCSV = <TData>({
	table,
	columns,
	queryClient,
	pathname,
	transactionType,
	type = "full",
}: ExportToCSVProps<TData>) => {
	const dataFull: Record<string, unknown>[] = [];
	const dataEmpty: Record<string, unknown>[] = [];
	if (type === "full") {
		// Obtém apenas as linhas selecionadas na tabela
		const rows = table.getSelectedRowModel().rows;

		// Prepara os dados para conversão
		const data = rows.map(row => {
			const rowData: Record<string, unknown> = {};

			for (const cell of row.getAllCells()) {
				const header = cell.column.columnDef.header;

<<<<<<< HEAD
				if (typeof header === "string") {
					if (pathname === "/transactions") {
						processValueWhenRouteIsTransactions({
							headerName: header as string,
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
							headerName: header as string,
							value: cell.getValue() as string | number,
							rowData,
							queryClient,
						});
					} else {
						rowData[header] = processValue(cell.getValue());
					}
=======
			if (typeof header === "string") {
				if (pathname === "/transactions") {
					processValueWhenRouteIsTransactions({
						headerName: header as string,
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
						headerName: header as string,
						value: cell.getValue() as string | number,
						rowData,
						queryClient,
					});
				} else {
					rowData[header] = processValue(cell.getValue());
>>>>>>> 8a8e194 (fix: change hash to name on import accounts and add balance and current balance on accounts table (#80))
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
		// Converte os dados para CSV usando Papa Parse
		const csvContent = Papa.unparse(type === "full" ? dataFull : dataEmpty, {
			quotes: true, // Coloca aspas em todos os campos
			header: true, // Inclui cabeçalhos
			delimiter: ",", // Usa vírgula como delimitador
		});

		// Cria um blob com o conteúdo CSV
		const blob = new Blob([`\ufeff${csvContent}`], {
			// Adiciona BOM para suporte a caracteres especiais
			type: "text/csv;charset=utf-8;",
		});

		// Cria e dispara o download
		const url = URL.createObjectURL(blob);
		const link = document.createElement("a");

		link.href = url;
		link.setAttribute("download", "dados_exportados.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error("Erro ao gerar CSV:", error);

		throw error;
	}
};
