import type { ColumnDef } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";

// Função para exportar dados selecionados de uma tabela para arquivo CSV
export const exportToCSV = <TData>(
	table: Table<TData>,
	columns: ColumnDef<TData>[]
) => {
	// Obtém apenas as linhas selecionadas na tabela
	const rows = table.getSelectedRowModel().rows;
	// Filtra apenas colunas que possuem um nome de cabeçalho definido
	const columnsWithHeader = columns.filter(
		col => typeof col.meta?.headerName === "string"
	);
	// Extrai os nomes dos cabeçalhos para a primeira linha do CSV
	const headers = columnsWithHeader.map(col => col.meta?.headerName as string);
	// Inicia o conteúdo CSV com a linha de cabeçalhos
	let csvContent = `${headers.join(",")}\n`;

	// Itera por cada linha selecionada
	for (const row of rows) {
		// Processa os dados da linha:
		const rowData = row
			.getVisibleCells()
			// Filtra apenas células de colunas que têm cabeçalho
			.filter(cell => {
				const header = cell.column.columnDef.meta?.headerName;
				return typeof header === "string";
			})
			// Formata cada valor de célula (coloca strings entre aspas e escapa aspas internas)
			.map(cell => {
				const value = cell.getValue();
				if (typeof value === "string") {
					// Substitui aspas por aspas duplas para escape em CSV
					return `"${value.replace(/"/g, '""')}"`;
				}
				return value;
			})
			// Junta todos os valores com vírgulas
			.join(",");

		// Adiciona a linha formatada ao conteúdo CSV
		csvContent += `${rowData}\n`;
	}

	// Cria um blob com o conteúdo CSV
	const blob = new Blob([csvContent], {
		type: "text/csv;charset=utf-8;",
	});
	// Cria uma URL para o blob
	const url = URL.createObjectURL(blob);
	// Cria um elemento de link para download
	const link = document.createElement("a");

	// Configura o link para download
	link.href = url;
	link.setAttribute("download", "dados_tabela.csv");
	// Adiciona o link ao DOM, simula um clique e depois remove
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
