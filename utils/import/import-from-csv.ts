import type { ColumnDef } from "@tanstack/react-table";
import Papa from "papaparse";
import { processValue } from "./_utils/process-value";

// Função auxiliar para processar valores importados

export const importFromCSV = async <TData>(
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

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			// Desabilita dynamicTyping para processar manualmente
			dynamicTyping: false,
			complete: (results: Papa.ParseResult<TData>) => {
				if (results.errors.length > 0) {
					console.error("Erros ao processar CSV:", results.errors);
					reject(new Error("Erro ao processar o arquivo CSV"));
					return;
				}

				// Processa os dados para usar as chaves corretas
				const data = results.data.map((row: TData) => {
					const processedRow: Partial<TData> = {};

					for (const [key, value] of Object.entries(row)) {
						const accessorKey = headerToAccessorMap[key] || key;
						// Processa o valor antes de atribuir
						const processedValue = processValue(value);
						processedRow[accessorKey as keyof TData] =
							processedValue as TData[keyof TData];
					}

					return processedRow as TData;
				});

				resolve(data);
			},
			error: (error: Error) => {
				console.error("Erro ao ler CSV:", error);
				reject(error);
			},
		});
	});
};
