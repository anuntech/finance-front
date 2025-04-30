import type { QueryClient } from "@tanstack/react-query";
import type { ColumnDef, Table } from "@tanstack/react-table";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import {
	processValue,
	processValueWhenRouteIsAccounts,
	processValueWhenRouteIsTransactions,
} from "./_utils/process-value";

interface Tag {
	tagId: string;
	subTagId: string;
}

interface ExportToPDFProps<TData> {
	table: Table<TData>;
	columns: ColumnDef<TData>[];
	queryClient: QueryClient;
	pathname: string;
}

export const exportToPDF = <TData>({
	table,
	columns,
	queryClient,
	pathname,
}: ExportToPDFProps<TData>) => {
	// Obtém apenas as linhas selecionadas na tabela
	const rows = table.getSelectedRowModel().rows;

	// Se não houver linhas selecionadas, seleciona todas
	const effectiveRows = rows.length > 0 ? rows : table.getRowModel().rows;

	// Cria uma nova instância de documento PDF
	const doc = new jsPDF();

	// Define os cabeçalhos das colunas para o PDF
	const headers = columns
		.filter(col => typeof col.header === "string")
		.map(col => {
			if (typeof col.header === "string") return col.header;
			if (col.header) return String(col.header);
		})
		.filter(Boolean);

	// Prepara os dados processados para o PDF
	const processedData = effectiveRows.map(row => {
		const rowData: Record<string, unknown> = {};

		for (const cell of row.getAllCells()) {
			const column = cell.column;
			const header =
				typeof column.columnDef.header === "string" && column.columnDef.header;

			if (pathname === "/transactions") {
				processValueWhenRouteIsTransactions({
					headerName: header,
					value: cell.getValue() as
						| string
						| number
						| boolean
						| Date
						| Array<Tag>,
					rowData,
					queryClient,
				});
			} else if (pathname === "/config/accounts") {
				processValueWhenRouteIsAccounts({
					headerName: header,
					value: cell.getValue() as string | number,
					rowData,
					queryClient,
				});
			} else {
				rowData[header] = processValue(cell.getValue());
			}
		}

		return rowData;
	});

	if (headers.length === 0 || processedData.length === 0) {
		console.warn("Nenhum dado para exportar para PDF");
		return;
	}

	// Número de colunas por grupo (ajuste conforme necessário)
	const COLUNAS_POR_GRUPO = 6;

	// Calcular quantos grupos de colunas teremos
	const numeroDeGrupos = Math.ceil(headers.length / COLUNAS_POR_GRUPO);

	// Adicionar um título ao PDF
	doc.setFontSize(16);
	doc.text("Dados da tabela", 14, 15);
	doc.setFontSize(10);
	doc.text(`Gerado em: ${new Date().toLocaleString("pt-BR")}`, 14, 22);

	let yPosition = 30; // Posição Y inicial para a primeira tabela

	// Para cada grupo de colunas
	for (let grupo = 0; grupo < numeroDeGrupos; grupo++) {
		// Obter o subconjunto de cabeçalhos para este grupo
		const inicioColuna = grupo * COLUNAS_POR_GRUPO;
		const fimColuna = Math.min((grupo + 1) * COLUNAS_POR_GRUPO, headers.length);
		const headersGrupo = headers.slice(inicioColuna, fimColuna);

		// Criar dados para este grupo de colunas
		const dadosGrupo = processedData.map(rowData => {
			return headersGrupo.map(header => rowData[header] || "");
		});

		// Configurar tabela para este grupo
		autoTable(doc, {
			startY: yPosition,
			head: [headersGrupo],
			body: dadosGrupo,
			theme: "grid",
			styles: {
				fontSize: 8,
				cellPadding: 3,
				overflow: "linebreak",
			},
			headStyles: {
				fillColor: [66, 66, 66],
				textColor: 255,
				fontSize: 9,
				fontStyle: "bold",
			},
			margin: { left: 10, right: 10 },
			tableWidth: "auto",
		});

		// Atualizar posição Y para a próxima tabela
		// Obtém a última posição Y após a tabela ser desenhada
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		const ultimaPosicao = (doc as any).lastAutoTable.finalY || 0;
		yPosition = ultimaPosicao + 15; // Adiciona espaço entre as tabelas

		// Verifica se precisa adicionar nova página
		if (
			yPosition > doc.internal.pageSize.height - 20 &&
			grupo < numeroDeGrupos - 1
		) {
			doc.addPage();
			yPosition = 20; // Reinicia a posição Y na nova página
		}
	}

	// Salva o arquivo PDF
	doc.save("dados_exportados.pdf");
};
