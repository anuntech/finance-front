import type { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { processValue } from "./_utils/process-value";

export const importFromExcel = async <TData>(
	file: File,
	columns: ColumnDef<TData>[]
): Promise<TData[]> => {
	return new Promise<TData[]>((resolve, reject) => {
		// Cria um mapa que relaciona o header exibido com o accessorKey
		const headerToAccessorMap: Record<string, string> = {};
		for (const col of columns) {
			const header =
				typeof col.meta?.headerName === "string" ? col.meta.headerName : "";
			if (
				header &&
				"accessorKey" in col &&
				typeof col.accessorKey === "string"
			) {
				headerToAccessorMap[header] = col.accessorKey;
			}
		}

		const reader = new FileReader();
		reader.onload = e => {
			try {
				const data = e.target?.result;
				const workbook = XLSX.read(data, { type: "binary" });
				const firstSheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[firstSheetName];

				// Converte para JSON com cabeçalhos
				const jsonData = XLSX.utils.sheet_to_json(worksheet);

				// Processa os dados para usar as chaves corretas
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const processedData = jsonData.map((row: any) => {
					const processedRow: Partial<TData> = {};

					for (const [key, value] of Object.entries(row)) {
						const accessorKey = headerToAccessorMap[key] || key;
						const processedValue = processValue(value);
						processedRow[accessorKey as keyof TData] =
							processedValue as TData[keyof TData];
					}

					return processedRow as TData;
				});

				resolve(processedData);
			} catch (error) {
				console.error("Erro ao processar Excel:", error);
				reject(error);
			}
		};

		reader.onerror = error => {
			console.error("Erro ao ler Excel:", error);
			reject(error);
		};

		reader.readAsBinaryString(file);
	});
};
