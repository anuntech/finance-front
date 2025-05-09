import type { ColumnDef } from "@tanstack/react-table";
import { processValue } from "./_utils/process-value";

export const importFromCSV = async <TData>(
	file: File,
	columns: ColumnDef<TData>[],
	config?: {
		countRows: number;
		ignoreHeaderMapping?: boolean;
		importAllColumns?: boolean;
		excludeColumns?: string[];
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

		const reader = new FileReader();
		reader.onload = e => {
			try {
				const csvText = e.target?.result as string;
				const lines = csvText.split("\n");

				// Pega os cabeçalhos da primeira linha
				const headers = lines[0].split(",").map(header => header.trim());
				// Remove a primeira linha (cabeçalhos) e processa o resto
				const data = lines.slice(1);

				// Limita a quantidade de linhas, se necessário
				const limitedData = config?.countRows
					? data.slice(0, config.countRows)
					: data;

				// Processa os dados para usar as chaves corretas
				const processedData = limitedData.map(line => {
					const values = line.split(",").map(value => value.trim());
					const processedRow: Partial<TData> = {};

					// Itera sobre os cabeçalhos para garantir que todas as colunas sejam processadas
					headers.forEach((header, index) => {
						// Pula a coluna se ela estiver na lista de exclusão
						if (config?.excludeColumns?.includes(header)) {
							return;
						}

						const value = values[index] ?? null;

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
					});

					return processedRow as TData;
				});

				resolve(processedData);
			} catch (error) {
				console.error("Erro ao processar CSV:", error);
				reject(error);
			}
		};

		reader.onerror = error => {
			console.error("Erro ao ler CSV:", error);
			reject(error);
		};

		reader.readAsText(file);
	});
};
