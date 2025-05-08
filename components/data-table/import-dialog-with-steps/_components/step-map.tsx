import { getColumns as getCategoriesColumns } from "@/app/config/[transaction]/columns";
import { columns as columnsOfAccounts } from "@/app/config/accounts/columns";
import { columns as columnsOfCustomFields } from "@/app/config/custom-fields/columns";
import { getColumns as getTransactionsColumns } from "@/app/transactions/columns";
import { Card, CardContent } from "@/components/ui/card";
import { FormControl, FormField, FormItem } from "@/components/ui/form";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { type CustomField, getCustomFields } from "@/http/custom-fields/get";
import { cn } from "@/lib/utils";
import Idea from "@/public/idea.svg";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import type { ImportForm } from "@/schemas/import";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { importFromCSV } from "@/utils/import/import-from-csv";
import { importFromExcel } from "@/utils/import/import-from-excel";
import { useQuery } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { ArrowRight, CircleX, Loader2 } from "lucide-react";
import Image from "next/image";
import { useParams, usePathname } from "next/navigation";
import {
	type Dispatch,
	type SetStateAction,
	use,
	useCallback,
	useEffect,
	useState,
} from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { useSteps } from "../_contexts/steps";

interface Header {
	header: string;
	headerName: string;
	accessorKey: string;
}

interface Row {
	key: string;
	value: unknown;
}

interface GetCurrentColumns {
	pathname: string;
	customFields?: Array<CustomField>;
	categoryId?: string;
}

const getCurrentColumns = ({
	pathname,
	customFields,
	categoryId,
}: GetCurrentColumns) => {
	if (pathname === "/transactions") {
		return getTransactionsColumns(customFields);
	}

	if (pathname === "/config/accounts") {
		return columnsOfAccounts;
	}

	if (pathname === "/config/recipes") {
		return getCategoriesColumns(CATEGORY_TYPE.RECIPE, categoryId);
	}

	if (pathname === "/config/expenses") {
		return getCategoriesColumns(CATEGORY_TYPE.EXPENSE, categoryId);
	}

	if (pathname === "/config/custom-fields") {
		return columnsOfCustomFields;
	}

	return [];
};

interface StepMapProps {
	isLoading: boolean;
	setIsLoading: Dispatch<SetStateAction<boolean>>;
}

export const StepMap = ({
	isLoading: isLoadingColumnsToMap,
	setIsLoading: setIsLoadingColumnsToMap,
}: StepMapProps) => {
	const pathname = usePathname();
	const { categoryId } = useParams();

	const [isErrorColumnsToMap, setIsErrorColumnsToMap] = useState(false);
	const [errorColumnsToMap, setErrorColumnsToMap] = useState("");
	const [columns, setColumns] = useState<Array<ColumnDef<unknown>>>([]);
	const [headers, setHeaders] = useState<Array<Header>>([]);
	const [rows, setRows] = useState<Array<Row>>([]);

	const { transactionType, setHeaders: setHeadersContext } = useSteps();

	const {
		data: customFields,
		isLoading: isLoadingCustomFields,
		isSuccess: isSuccessCustomFields,
	} = useQuery({
		queryKey: customFieldsKeys.all,
		queryFn: () => getCustomFields(),
		select: data =>
			data.filter(
				customField =>
					customField.transactionType ===
					(TRANSACTION_TYPE.ALL || transactionType)
			),
	});

	const form = useFormContext<ImportForm>();

	useEffect(() => {
		const hasError = !isSuccessCustomFields && !isLoadingCustomFields;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar campos personalizados");
			}, 0);

			return () => clearTimeout(timeoutId);
		}

		const columns = getCurrentColumns({
			pathname,
			customFields,
			categoryId: categoryId as string,
		});

		if (!columns || columns.length === 0) {
			return;
		}

		setColumns(columns as Array<ColumnDef<unknown>>);
		setHeaders(
			columns
				.filter(column => typeof column.header === "string")
				.map(column => ({
					header: column.header as string,
					headerName: column.meta.headerName as string,
					accessorKey:
						// @ts-ignore - accessorKey is exists
						(column.accessorKey as string) ?? column.id.split("-")[1],
				}))
		);
	}, [
		categoryId,
		isSuccessCustomFields,
		isLoadingCustomFields,
		pathname,
		customFields,
	]);

	useEffect(() => {
		setHeadersContext(headers);
	}, [headers, setHeadersContext]);

	const readOneRowOfCurrentFile = useCallback(
		async (data: ImportForm) => {
			const files = data.import as FileList;

			if (files.length === 0) {
				toast.error("Nenhum arquivo selecionado");

				return;
			}

			const [file] = files;

			try {
				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
				let fileImported: Array<any> = [];

				if (
					file.type ===
					"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
				) {
					fileImported = await importFromExcel(file, columns, {
						countRows: 1,
						ignoreHeaderMapping: true,
						importAllColumns: true,
					});
				}

				if (file.type === "text/csv") {
					fileImported = await importFromCSV(file, columns, {
						countRows: 1,
						ignoreHeaderMapping: true,
						importAllColumns: true,
					});
				}

				if (fileImported.length === 0)
					throw new Error("Nenhum dado encontrado");

				setRows(
					fileImported.flatMap(row =>
						Object.entries(row).reduce((acc, [key, value]) => {
							acc.push({ key, value });
							return acc;
						}, [] as Row[])
					)
				);
			} catch (error) {
				toast.error(`Erro ao importar arquivo: ${error.message}`);
			}
		},
		[columns]
	);

	const importFile = form.watch("import");

	useEffect(() => {
		readOneRowOfCurrentFile({ import: importFile });
	}, [importFile, readOneRowOfCurrentFile]);

	const columnsToMap = form.watch("columnsToMap");

	useEffect(() => {
		if (!rows || rows.length === 0 || columnsToMap.length > 0) {
			if (isLoadingColumnsToMap && columnsToMap.length > 0)
				setIsLoadingColumnsToMap(false);

			return;
		}

		const columnsToMapMapped = rows.map(row => ({
			key: row.key,
			keyToMap: headers.find(header => header.header === row.key)?.header || "",
			isCustomField: row.key.startsWith("CF-"),
		}));

		if (columnsToMapMapped.length < headers.length) {
			const errorMessage = `Não existem colunas o suficientes para mapear todos os campos necessários (${columnsToMapMapped.length} colunas encontradas, ${headers.length} colunas necessárias)`;

			toast.error(errorMessage);

			setIsErrorColumnsToMap(true);
			setErrorColumnsToMap(errorMessage);

			return;
		}

		form.setValue("columnsToMap", columnsToMapMapped);

		const keysToMapMapped = columnsToMapMapped.filter(
			column => column.keyToMap !== ""
		);

		if (keysToMapMapped.length < headers.length) {
			form.setError("columnsToMap", {
				message: "Existem colunas que não foram mapeadas",
			});
		}

		setIsLoadingColumnsToMap(false);
	}, [
		rows,
		form,
		columnsToMap,
		headers,
		isLoadingColumnsToMap,
		setIsLoadingColumnsToMap,
	]);

	return (
		<div className="flex h-full w-full flex-col items-center justify-between gap-4">
			{isErrorColumnsToMap && (
				<div className="flex h-full w-full flex-col items-center justify-center gap-4">
					<header className="my-4">
						<h2 className="flex flex-col gap-2 text-center font-bold text-xl">
							<span>Houve um erro ao mapear as colunas:</span>
							<span className="text-red-500 text-sm">{errorColumnsToMap}</span>
						</h2>
					</header>
					<CircleX className="h-16 w-16 text-red-500" />
				</div>
			)}
			{isLoadingColumnsToMap && !isErrorColumnsToMap && (
				<div className="flex h-full w-full items-center justify-center">
					<Loader2 className="h-8 w-8 animate-spin text-primary" />
				</div>
			)}
			{!isLoadingColumnsToMap && !isErrorColumnsToMap && (
				<>
					<header className="flex h-full w-full items-center justify-center gap-4">
						<aside>
							<Image src={Idea} width={64} height={64} alt="Lâmpada" />
						</aside>
						<div className="flex flex-col gap-4">
							<div>
								<h3 className="font-medium text-sm">Mapeamento</h3>
								<p className="text-justify text-sm">
									Defina como deve ser o mapeamento das colunas da planilha
									importada.
								</p>
							</div>
						</div>
					</header>
					<ScrollArea
						className={cn(
							"max-h-[38dvh] min-h-[38dvh] min-w-[38dvw] rounded-md",
							form.formState.errors.columnsToMap &&
								"max-h-[36dvh] min-h-[36dvh]"
						)}
					>
						<div className="flex w-full items-center justify-center">
							<ul className="flex w-[45%] flex-col gap-4 rounded-md bg-smooth p-4">
								{rows.map(row => (
									<li key={row.key} className="h-16 w-full">
										<div className="h-full w-full">
											<Card className="h-full w-full">
												<CardContent className="flex flex-col gap-1 px-4 py-2">
													<span
														className="truncate font-semibold text-primary text-sm"
														title={row.key}
													>
														{row.key}
													</span>
													<input
														className="border-none font-medium text-primary text-sm outline-none"
														readOnly
														value={(row.value as string | number) || ""}
													/>
												</CardContent>
											</Card>
										</div>
									</li>
								))}
							</ul>
							<ul className="flex w-[10%] flex-col gap-4">
								{rows.map(row => (
									<li
										key={row.key}
										className="flex min-h-16 w-full items-center justify-center"
									>
										<ArrowRight className="h-8 w-8 text-primary opacity-25" />
									</li>
								))}
							</ul>
							<ul className="flex w-[45%] flex-col gap-4 rounded-md bg-smooth p-4">
								{columnsToMap.map((columnToMap, index) => (
									<li key={columnToMap.key} className="h-16 w-full">
										<div className="h-full w-full">
											<FormField
												control={form.control}
												name={`columnsToMap.${index}.keyToMap`}
												render={({ field }) => (
													<FormItem className="h-full w-full">
														<FormControl>
															<Select
																value={field.value || ""}
																onValueChange={value => {
																	const indexOfColumnToRemove =
																		columnsToMap.findIndex(
																			column => column.key === value
																		);

																	const columnToMap = form.getValues(
																		`columnsToMap.${indexOfColumnToRemove}.keyToMap`
																	);

																	if (columnToMap === value) {
																		form.setValue(
																			`columnsToMap.${indexOfColumnToRemove}.keyToMap`,
																			""
																		);
																		form.setValue(
																			`columnsToMap.${indexOfColumnToRemove}.isCustomField`,
																			value.startsWith("CF-")
																		);
																	}

																	const columnsWithCurrentValueToMap =
																		columnsToMap.filter(
																			column => column.keyToMap === value
																		);

																	if (columnsWithCurrentValueToMap.length > 0) {
																		const indexOfColumnWithCurrentValueToMap =
																			columnsToMap.findIndex(
																				column => column.keyToMap === value
																			);

																		form.setValue(
																			`columnsToMap.${indexOfColumnWithCurrentValueToMap}.keyToMap`,
																			""
																		);
																		form.setValue(
																			`columnsToMap.${indexOfColumnWithCurrentValueToMap}.isCustomField`,
																			value.startsWith("CF-")
																		);
																	}

																	field.onChange(value);

																	const columnsToMapMapped =
																		form.getValues("columnsToMap");

																	const keysToMapMapped =
																		columnsToMapMapped.filter(
																			column => column.keyToMap !== ""
																		);

																	if (keysToMapMapped.length < headers.length) {
																		form.setError("columnsToMap", {
																			message:
																				"Existem colunas que não foram mapeadas",
																		});

																		return;
																	}

																	form.clearErrors("columnsToMap");
																}}
															>
																<SelectTrigger
																	className={cn(
																		"h-full w-full px-4 py-2 font-semibold text-primary text-sm",
																		form.formState.errors.columnsToMap &&
																			"data-[placeholder]:text-red-500"
																	)}
																>
																	<SelectValue placeholder="Selecione uma coluna" />
																</SelectTrigger>
																<SelectContent>
																	{headers.map(header => (
																		<SelectItem
																			key={header.header}
																			value={header.header}
																		>
																			{header.headerName}
																		</SelectItem>
																	))}
																</SelectContent>
															</Select>
														</FormControl>
													</FormItem>
												)}
											/>
										</div>
									</li>
								))}
							</ul>
						</div>
					</ScrollArea>
					{form.formState.errors.columnsToMap && (
						<footer className="flex w-full items-center justify-center">
							<span className="font-medium text-red-500 text-sm">
								{form.formState.errors.columnsToMap.message}
							</span>
						</footer>
					)}
				</>
			)}
		</div>
	);
};
