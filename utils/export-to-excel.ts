import type { Table } from "@tanstack/react-table";

import * as XLSX from "xlsx";

export const exportToExcel = <TData>(table: Table<TData>) => {
	// Obtém apenas as linhas selecionadas na tabela
	const rows = table.getSelectedRowModel().rows;
	// Cria um array de objetos onde cada objeto representa uma linha para o Excel
	const dataForExcel = rows.map(row => {
		// Cria um objeto vazio para armazenar os dados da linha atual
		const rowData: Record<string, string> = {};

		// Itera por cada célula visível na linha
		for (const cell of row.getVisibleCells()) {
			// Obtém o nome do cabeçalho da coluna ou string vazia se não for uma string
			const key =
				typeof cell.column.columnDef.meta?.headerName === "string"
					? cell.column.columnDef.meta.headerName
					: "";

			// Adiciona o valor da célula ao objeto usando o nome do cabeçalho como chave
			rowData[key] = cell.getValue() as string;
		}

		// Retorna o objeto completo representando uma linha
		return rowData;
	});
	// Converte o array de objetos para uma planilha Excel
	const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
	// Cria um novo livro de trabalho Excel
	const workbook = XLSX.utils.book_new();

	// Adiciona a planilha ao livro com o nome "Dados"
	XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
	// Salva o arquivo Excel com o nome "dados_tabela.xlsx"
	XLSX.writeFile(workbook, "dados_tabela.xlsx");
};
