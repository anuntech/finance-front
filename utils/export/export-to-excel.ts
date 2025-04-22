import type { Table } from "@tanstack/react-table";

import type { QueryClient } from "@tanstack/react-query";
import * as XLSX from "xlsx";
import {
	processValue,
	processValueWhenRouteIsTransactions,
} from "./_utils/process-value";

interface Tag {
	tagId: string;
	subTagId: string;
}

interface ExportToExcelProps<TData> {
	table: Table<TData>;
	pathname: string;
	queryClient: QueryClient;
}

export const exportToExcel = <TData>({
	table,
	pathname,
	queryClient,
}: ExportToExcelProps<TData>) => {
	// Obtém apenas as linhas selecionadas na tabela
	const rows = table.getSelectedRowModel().rows;

	// Cria um array de objetos onde cada objeto representa uma linha para o Excel
	const dataForExcel = rows.map(row => {
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
				} else {
					rowData[key] = processValue(cell.getValue()) as string;
				}
			}
		}

		return rowData;
	});

	try {
		// Converte o array de objetos para uma planilha Excel
		const worksheet = XLSX.utils.json_to_sheet(dataForExcel);

		// Ajusta a largura das colunas
		const columnWidths = {};
		for (const row of dataForExcel) {
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
		XLSX.writeFile(workbook, "dados_tabela.xlsx");
	} catch (error) {
		console.error("Erro ao gerar Excel:", error);
		throw error;
	}
};
