import type { ColumnDef } from "@tanstack/react-table";
import Papa from "papaparse";
import { processValue } from "./_utils/process-value";

// Função auxiliar para processar valores importados

export const importFromCSV = async <TData>(
	file: File,
	columns: ColumnDef<TData>[],
	config?: {
		countRows: number;
		ignoreHeaderMapping?: boolean;
		importAllColumns?: boolean;
		excludeColumns?: string[];
		filterNullColumns?: boolean;
	}
): Promise<TData[]> => {
	return new Promise<TData[]>((resolve, reject) => {
		// Cria um mapa que relaciona o header exibido com o accessorKey
		const headerToAccessorMap: Record<string, string> = {};

		// Só cria o mapa se não estiver ignorando o mapeamento
		if (!config?.ignoreHeaderMapping) {
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
		}

		const data: TData[] = [];
		let rowCount = 0;
		let headers: string[] = [];
		const nonNullCount = new Map<string, number>();

		Papa.parse(file, {
			header: true,
			skipEmptyLines: true,
			// Desabilita dynamicTyping para processar manualmente
			dynamicTyping: false,
			step: (results, parser) => {
				if (results.errors.length > 0) {
					parser.abort();
					reject(new Error("Erro ao processar o arquivo CSV"));
					return;
				}

				// Na primeira linha, inicializa os cabeçalhos e o contador de valores não nulos
				if (rowCount === 0) {
					headers = Object.keys(results.data as object);
					for (const header of headers) {
						nonNullCount.set(header, 0);
					}
				}

				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const row = results.data as Record<string, any>;
				const processedRow: Partial<TData> = {};

				// Conta valores não nulos em cada coluna
				for (const header of headers) {
					const value = row[header];
					if (value !== null && value !== undefined && value !== "") {
						nonNullCount.set(header, (nonNullCount.get(header) || 0) + 1);
					}
				}

				// Processa a linha
				for (const header of headers) {
					// Pula a coluna se ela estiver na lista de exclusão
					if (config?.excludeColumns?.includes(header)) {
						continue;
					}

					const value = row[header];

					// Se estiver ignorando o mapeamento, usa a chave diretamente
					const accessorKey = config?.ignoreHeaderMapping
						? header
						: headerToAccessorMap[header] || header;

					// Se não estiver importando todas as colunas, verifica se a coluna existe no mapeamento
					if (
						!config?.importAllColumns &&
						!headerToAccessorMap[header] &&
						!config?.ignoreHeaderMapping
					) {
						return;
					}

					const processedValue = processValue(value);
					processedRow[accessorKey as keyof TData] =
						processedValue as TData[keyof TData];
				}

				data.push(processedRow as TData);
				rowCount++;

				if (config?.countRows && rowCount >= config.countRows) {
					parser.abort();
					resolve(data);
				}
			},
			complete: () => {
				// Se a filtragem de colunas nulas estiver ativa (padrão), remove as colunas nulas
				if (config?.filterNullColumns !== false) {
					const nullColumns = new Set<string>();
					nonNullCount.forEach((count, header) => {
						if (count === 0) {
							nullColumns.add(header);
						}
					});

					// Remove as colunas nulas dos dados processados
					const finalData = data.map(row => {
						const filteredRow: Partial<TData> = {};
						for (const [key, value] of Object.entries(row)) {
							if (!nullColumns.has(key)) {
								filteredRow[key as keyof TData] = value;
							}
						}

						return filteredRow as TData;
					});

					resolve(finalData);
				} else {
					resolve(data);
				}
			},
			error: (error: Error) => {
				console.error("Erro ao ler CSV:", error);
				reject(error);
			},
		});
	});
};
