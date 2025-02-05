import type { ColumnDef } from "@tanstack/react-table";

import type { Table } from "@tanstack/react-table";

export const exportToCSV = <TData>(
	table: Table<TData>,
	columns: ColumnDef<TData>[]
) => {
	const rows = table.getRowModel().rows;
	const headers = columns.map(col =>
		typeof col.header === "string" ? col.header : ""
	);
	let csvContent = `${headers.join(",")}\n`;

	for (const row of rows) {
		const rowData = row
			.getVisibleCells()
			.map(cell => {
				const value = cell.getValue();
				if (typeof value === "string") {
					return `"${value.replace(/"/g, '""')}"`;
				}
				return value;
			})
			.join(",");
		csvContent += `${rowData}\n`;
	}

	const blob = new Blob([csvContent], {
		type: "text/csv;charset=utf-8;",
	});
	const url = URL.createObjectURL(blob);
	const link = document.createElement("a");
	link.href = url;
	link.setAttribute("download", "dados_tabela.csv");
	document.body.appendChild(link);
	link.click();
	document.body.removeChild(link);
};
