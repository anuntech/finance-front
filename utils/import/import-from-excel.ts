import type { ColumnDef } from "@tanstack/react-table";
import * as XLSX from "xlsx";
import { processValue } from "./_utils/process-value";

export const importFromExcel = async <TData>(
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
				const data = e.target?.result;
				const workbook = XLSX.read(data, { type: "binary" });
				const firstSheetName = workbook.SheetNames[0];
				const worksheet = workbook.Sheets[firstSheetName];

				// Converte para JSON com cabeçalhos, incluindo células vazias
				let jsonData = XLSX.utils.sheet_to_json(worksheet, {
					defval: null, // Define valor padrão para células vazias
					header: 1, // Usa a primeira linha como cabeçalho
					// raw: false, // Converte todos os valores para string
				});

				// Pega os cabeçalhos da primeira linha
				const headers = jsonData[0] as string[];
				// Remove a primeira linha (cabeçalhos) e processa o resto
				jsonData = jsonData.slice(1);

				// Limita a quantidade de linhas, se necessário
				if (config?.countRows) {
					jsonData = jsonData.slice(0, config.countRows);
				}

				// Processa os dados para usar as chaves corretas
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				const processedData = jsonData.map((row: any) => {
					const processedRow: Partial<TData> = {};

					// Itera sobre os cabeçalhos para garantir que todas as colunas sejam processadas
					headers.forEach((header, index) => {
						// Pula a coluna se ela estiver na lista de exclusão
						if (config?.excludeColumns?.includes(header)) {
							return;
						}

						const value = row[index] ?? null;

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
