import type { ColumnDef } from "@tanstack/react-table";

function parseCSVLine(line: string): string[] {
	const result: string[] = [];
	let currentField = "";
	let insideQuotes = false;

	for (let i = 0; i < line.length; i++) {
		const char = line[i];

		if (char === '"') {
			if (insideQuotes && i + 1 < line.length && line[i + 1] === '"') {
				// Trata aspas duplas escapadas
				currentField += '"';
				i++; // pula a aspa escapada
			} else {
				insideQuotes = !insideQuotes;
			}
		} else if (char === "," && !insideQuotes) {
			// Final de um campo
			result.push(currentField);
			currentField = "";
		} else {
			currentField += char;
		}
	}

	result.push(currentField);
	return result;
}

// Função auxiliar para converter o valor para número quando possível
function convertValue(value: string): string | number {
	const trimmed = value.trim();
	// Verifica se o valor é um número inteiro ou decimal (negativos também)
	if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
		return Number(trimmed);
	}
	return value;
}

export const importFromCSV = async <TData>(
	file: File,
	columns: ColumnDef<TData>[]
): Promise<TData[]> => {
	return new Promise<TData[]>((resolve, reject) => {
		const reader = new FileReader();

		reader.onerror = () => {
			reader.abort();
			reject(new Error("Falha ao ler o arquivo CSV."));
		};

		reader.onload = () => {
			const result = reader.result;
			if (typeof result !== "string") {
				reject(new Error("O conteúdo do arquivo CSV não é uma string."));
				return;
			}

			const csvContent = result;
			const lines = csvContent
				.split(/\r?\n/)
				.filter(line => line.trim() !== "");
			if (lines.length === 0) {
				resolve([]);
				return;
			}

			// Extrai o cabeçalho do CSV
			const fileHeaders = parseCSVLine(lines[0]);

			// Cria um mapa que relaciona o header exibido com o accessorKey esperado
			const headerToAccessorMap: Record<string, string> = {};
			// biome-ignore lint/complexity/noForEach: <explanation>
			columns.forEach(col => {
				const header = typeof col.header === "string" ? col.header : "";
				// Utiliza o accessorKey em vez de id para tipagem mais segura
				if (
					header &&
					"accessorKey" in col &&
					typeof col.accessorKey === "string"
				) {
					headerToAccessorMap[header] = col.accessorKey;
				}
			});

			// Verifica se todos os cabeçalhos do CSV possuem mapeamento para um accessorKey
			const missingMapping = fileHeaders.filter(
				header => !headerToAccessorMap[header]
			);
			if (missingMapping.length > 0) {
				console.warn(
					"Os seguintes cabeçalhos do CSV não possuem mapeamento para accessorKey:",
					missingMapping
				);
			}

			const data: TData[] = [];

			// Processa cada linha (exceto o cabeçalho)
			for (let i = 1; i < lines.length; i++) {
				const rowValues = parseCSVLine(lines[i]);
				if (rowValues.length !== fileHeaders.length) {
					// Linha com número de colunas diferente; pode ser ignorada ou tratada de outra forma
					continue;
				}

				const rowObject: Partial<TData> = {};

				for (let j = 0; j < fileHeaders.length; j++) {
					const csvHeader = fileHeaders[j];
					// Utiliza o accessorKey mapeado a partir do header do CSV, se existir;
					// caso contrário, usa o próprio header (como fallback)
					const key = headerToAccessorMap[csvHeader] || csvHeader;
					rowObject[key as keyof TData] = convertValue(
						rowValues[j]
					) as unknown as TData[keyof TData];
				}
				data.push(rowObject as TData);
			}

			resolve(data);
		};

		reader.readAsText(file, "UTF-8");
	});
};
