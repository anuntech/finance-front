import type { QueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";
import Papa from "papaparse";
import {
	processValue,
	processValueWhenRouteIsAccounts,
	processValueWhenRouteIsTransactions,
} from "./_utils/process-value";

interface Tag {
	tagId: string;
	subTagId: string;
}

interface ExportToCSVProps<TData> {
	table: Table<TData>;
	columns: ColumnDef<TData>[];
	queryClient: QueryClient;
	pathname: string;
}

// Função para exportar dados selecionados de uma tabela para arquivo CSV
export const exportToCSV = <TData>({
	table,
	queryClient,
	pathname,
}: ExportToCSVProps<TData>) => {
	// Obtém apenas as linhas selecionadas na tabela
	const rows = table.getSelectedRowModel().rows;

	// Prepara os dados para conversão
	const data = rows.map(row => {
		const rowData: Record<string, unknown> = {};

		for (const cell of row.getAllCells()) {
			const header = cell.column.columnDef.header;

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
			}
		}
		return rowData;
	});

	try {
		// Converte os dados para CSV usando Papa Parse
		const csvContent = Papa.unparse(data, {
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
		link.setAttribute("download", "dados_tabela.csv");
		document.body.appendChild(link);
		link.click();
		document.body.removeChild(link);
		URL.revokeObjectURL(url);
	} catch (error) {
		console.error("Erro ao gerar CSV:", error);
		throw error;
	}
};
