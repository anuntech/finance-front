import type { ColumnDef, Table } from "@tanstack/react-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export const exportToPDF = <TData>(
	table: Table<TData>,
	columns: ColumnDef<TData>[]
) => {
	const doc = new jsPDF();
	const headers = [
		columns.map(col => (typeof col.header === "string" ? col.header : "")),
	];
	const rowsData = table
		.getRowModel()
		.rows.map(row => row.getVisibleCells().map(cell => cell.getValue()));
	autoTable(doc, {
		head: headers,
		body: rowsData,
	});

	doc.save("dados_tabela.pdf");
};
