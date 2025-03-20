import type { Table } from "@tanstack/react-table";

import * as XLSX from "xlsx";

// TODO: Refatorar para usar o headerName
export const exportToExcel = <TData>(table: Table<TData>) => {
	const rows = table.getSelectedRowModel().rows;
	const dataForExcel = rows.map(row => {
		const rowData: Record<string, string> = {};

		for (const cell of row.getVisibleCells()) {
			const key =
				typeof cell.column.columnDef.header === "string"
					? cell.column.columnDef.header
					: "";

			rowData[key] = cell.getValue() as string;
		}

		return rowData;
	});
	const worksheet = XLSX.utils.json_to_sheet(dataForExcel);
	const workbook = XLSX.utils.book_new();

	XLSX.utils.book_append_sheet(workbook, worksheet, "Dados");
	XLSX.writeFile(workbook, "dados_tabela.xlsx");
};
