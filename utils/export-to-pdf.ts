import type { ColumnDef, Table } from "@tanstack/react-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = <TData>(
	table: Table<TData>,
	columns: ColumnDef<TData>[]
) => {
	// Cria uma nova instância de documento PDF
	const doc = new jsPDF();
	// Define os cabeçalhos das colunas para o PDF
	const headers = [
		columns.map(col =>
			typeof col.meta?.headerName === "string" ? col.meta.headerName : ""
		),
	];
	// Obtém as linhas selecionadas e extrai os valores de cada célula
	const rowsData = table
		.getSelectedRowModel()
		.rows.map(row => row.getVisibleCells().map(cell => cell.getValue()));
	// Cria uma tabela automática no PDF com os cabeçalhos e dados
	autoTable(doc, {
		head: headers,
		body: rowsData,
	});

	// Salva o arquivo PDF com o nome "dados_tabela.pdf"
	doc.save("dados_tabela.pdf");
};
