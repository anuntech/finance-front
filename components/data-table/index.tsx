"use client";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Table,
	TableBody,
	TableCell,
	TableFooter,
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import { CONFIGS } from "@/configs";
import { useSearch } from "@/contexts/search";
import { cn } from "@/lib/utils";
import { FREQUENCY } from "@/types/enums/frequency";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { DialogProps, IFormData } from "@/types/form-data";
import { exportToCSV } from "@/utils/export/export-to-csv";
import { exportToExcel } from "@/utils/export/export-to-excel";
import { exportToPDF } from "@/utils/export/export-to-pdf";
import { useQueryClient } from "@tanstack/react-query";
import {
	type ColumnDef,
	type ColumnFiltersState,
	type SortingState,
	type VisibilityState,
	flexRender,
	getCoreRowModel,
	getFilteredRowModel,
	getPaginationRowModel,
	getSortedRowModel,
	useReactTable,
} from "@tanstack/react-table";
import { useVirtualizer } from "@tanstack/react-virtual";
import {
	ArrowUpDown,
	Download,
	Grid2X2Check,
	ListRestart,
	Pencil,
	RotateCcw,
	Search,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useRef, useState } from "react";
import { EditDialog } from "../actions/edit-dialog";
import { SkeletonForOnlyTable } from "../skeleton-table";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { ImportDialog, type ImportMutation } from "./import-dialog";

interface Props<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	addComponentIsOpen: boolean;
	setAddComponentIsOpen: (isOpen: boolean) => void;
	details: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	addDialogProps?: DialogProps;
	importDialogIsOpen: boolean;
	setImportDialogIsOpen: (isOpen: boolean) => void;
	importMutation: ImportMutation;
	transactionType?: TRANSACTION_TYPE;
	setTransactionType?: (type: TRANSACTION_TYPE) => void;
	isLoadingData?: boolean;
	isLoadingColumns?: boolean;
}

export const DataTable = <TData, TValue>({
	data,
	columns,
	addComponentIsOpen,
	setAddComponentIsOpen,
	details,
	FormData,
	addDialogProps,
	importDialogIsOpen,
	setImportDialogIsOpen,
	transactionType,
	importMutation,
	setTransactionType,
	isLoadingData = false,
	isLoadingColumns = false,
}: Props<TData, TValue>) => {
	const pathname = usePathname();

	const { components, functions } = CONFIGS.CONFIGURATION_ROUTES.find(
		route => route.path === pathname
	);

	if (!components) {
		throw new Error("Components not found!");
	}

	const { AddComponent } = components;

	if (!AddComponent) {
		throw new Error("AddComponent not found!");
	}

	const queryClient = useQueryClient();

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	// const [pagination, setPagination] = useState({
	// 	pageIndex: 0,
	// 	pageSize: 20,
	// });
	const [columnSizing, setColumnSizing] = useState({});
	const [openFilterId, setOpenFilterId] = useState<string | null>(null);
	const [editManyComponentIsOpen, setEditManyComponentIsOpen] = useState(false);
	const [editManyTransactionType, setEditManyTransactionType] =
		useState<TRANSACTION_TYPE | null>(null);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		// onPaginationChange: setPagination,
		onColumnSizingChange: setColumnSizing,
		columnResizeMode: "onChange",
		getCoreRowModel: getCoreRowModel(),
		// getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		getRowId: (row: any) => {
			if (row.frequency === FREQUENCY.REPEAT) {
				return `${row.id}_${row.repeatSettings.currentCount}`;
			}

			return row.id;
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
			// pagination,
			columnSizing,
		},
		defaultColumn: {
			size: 175,
		},
		filterFns: {
			arrIncludesSomeBoolean: (row, columnId, filterValues) => {
				if (!filterValues.length) return true;

				const value = String(row.getValue(columnId));

				return filterValues.includes(value);
			},
		},
	});

	// useEffect(() => {
	// 	const updatePageSize = () => {
	// 		const ITEM_HEIGHT = 72.5;
	// 		const HEIGHT_DISCOUNT = 300;
	// 		const newPageSize = Math.floor(
	// 			(window.innerHeight - HEIGHT_DISCOUNT) / ITEM_HEIGHT
	// 		);
	// 		if (newPageSize > 0)
	// 			setPagination(prev => ({ ...prev, pageSize: newPageSize }));
	// 	};
	// 	updatePageSize();
	// 	window.addEventListener("resize", updatePageSize);
	// 	return () => window.removeEventListener("resize", updatePageSize);
	// }, []);

	const { search, setSearch } = useSearch();

	const [searchFilter, setSearchFilter] = useState(search);

	useEffect(() => {
		const timer = setTimeout(() => {
			setSearch(searchFilter);
		}, 500); // 500ms delay

		return () => clearTimeout(timer);
	}, [searchFilter, setSearch]);

	const isLoading = isLoadingData || isLoadingColumns;

	const isTransactionsWithRecipeTypeSelected =
		table
			.getFilteredSelectedRowModel()
			.rows.filter(row => row.original.type === TRANSACTION_TYPE.RECIPE)
			.length > 0;

	const isTransactionsWithExpenseTypeSelected =
		table
			.getFilteredSelectedRowModel()
			.rows.filter(row => row.original.type === TRANSACTION_TYPE.EXPENSE)
			.length > 0;

	const containerRef = useRef<HTMLDivElement>(null);

	const virtualRows = useVirtualizer({
		count: table.getRowModel().rows.length,
		getScrollElement: () => containerRef.current,
		estimateSize: () => 60,
		overscan: 5,
	});

	useEffect(() => {
		virtualRows.measure();
	}, [virtualRows]);

	return (
		<div className=" flex min-h-[calc(100vh-6rem)] w-full flex-col justify-between gap-2">
			<div className="">
				<div className="flex items-center justify-between gap-4 py-4">
					<div className="flex items-center gap-2">
						<div className="relative w-full max-w-sm">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground" />
							<Input
								placeholder="Procurar..."
								value={
									pathname === "/transactions" ? searchFilter : globalFilter
								}
								onChange={event => {
									if (pathname === "/transactions") {
										setSearchFilter(event.target.value);
									} else {
										setGlobalFilter(event.target.value);
									}
								}}
								className="pl-10"
								disabled={isLoadingColumns}
							/>
						</div>
						<Button
							variant="outline"
							title="Limpar ordenação e filtros"
							onClick={() => {
								setSorting([]);
								setColumnFilters([]);
								setGlobalFilter("");
							}}
							disabled={isLoading}
						>
							<ListRestart />
						</Button>
						<Button
							variant="outline"
							title="Limpar seleção"
							onClick={() => setRowSelection({})}
							disabled={isLoading}
						>
							<RotateCcw />
						</Button>
					</div>
					<div className="flex items-center gap-2">
						<AddComponent
							addDialogIsOpen={addComponentIsOpen}
							transactionType={transactionType}
							setAddDialogIsOpen={setAddComponentIsOpen}
							setTransactionType={setTransactionType}
							details={details}
							FormData={FormData}
							dialogProps={addDialogProps}
							disabled={isLoading}
						/>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="ml-auto"
									title="Visualização"
									disabled={isLoading}
								>
									<Grid2X2Check />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								{table
									.getAllColumns()
									.filter(column => column.getCanHide())
									.map(column => {
										return (
											<DropdownMenuCheckboxItem
												key={column.id}
												className="capitalize"
												checked={column.getIsVisible()}
												onCheckedChange={value =>
													column.toggleVisibility(!!value)
												}
											>
												{column.columnDef.meta?.headerName}
											</DropdownMenuCheckboxItem>
										);
									})}
							</DropdownMenuContent>
						</DropdownMenu>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="ml-auto"
									title="Exportar"
									disabled={
										table.getSelectedRowModel().rows.length === 0 ||
										!functions.export ||
										isLoading
									}
								>
									<Download />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem>
									<button
										type="button"
										onClick={() =>
											exportToExcel({ table, pathname, queryClient })
										}
										className="w-full text-left"
									>
										Excel
									</button>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<button
										type="button"
										onClick={() =>
											exportToCSV({ table, columns, queryClient, pathname })
										}
										className="w-full text-left"
									>
										CSV
									</button>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<button
										type="button"
										onClick={() =>
											exportToPDF({ table, columns, queryClient, pathname })
										}
										className="w-full text-left"
									>
										PDF
									</button>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
						<ImportDialog
							importDialogIsOpen={importDialogIsOpen}
							setImportDialogIsOpen={setImportDialogIsOpen}
							importMutation={importMutation}
							columns={columns}
							disabled={isLoading}
						/>
					</div>
				</div>
				{table.getFilteredSelectedRowModel().rows.length > 0 &&
					pathname === "/transactions" &&
					!isLoading && (
						<>
							<div className="my-2 flex w-full flex-col items-end rounded-md border">
								<Button
									variant="outline"
									title="Editar"
									className="scale-75 self-end"
									onClick={() => {
										setEditManyComponentIsOpen(true);
										setEditManyTransactionType(
											isTransactionsWithRecipeTypeSelected
												? TRANSACTION_TYPE.RECIPE
												: TRANSACTION_TYPE.EXPENSE
										);
									}}
									disabled={
										isTransactionsWithRecipeTypeSelected &&
										isTransactionsWithExpenseTypeSelected
									}
								>
									<Pencil />
								</Button>
							</div>
							<EditDialog
								editType="many"
								editDialogIsOpen={editManyComponentIsOpen}
								setEditDialogIsOpen={setEditManyComponentIsOpen}
								dialogProps={{
									dialogContent: {
										className: "max-w-[100dvh] overflow-y-auto max-w-screen-md",
									},
								}}
								details={details}
								FormData={FormData}
								id={table
									.getFilteredSelectedRowModel()
									.rows.filter(
										row => row.original.type === editManyTransactionType
									)
									.map(row => row.original.id)
									.join(",")}
								transactionType={editManyTransactionType}
							/>
						</>
					)}
				{isLoadingColumns && <SkeletonForOnlyTable />}
				{!isLoadingColumns && (
					<div className="rounded-md border">
						<Table
							containerClassName="max-h-[calc(100vh-26rem)]"
							className="w-full table-fixed"
							containerRef={containerRef}
							onScrollContainer={() => virtualRows.measure()}
						>
							<colgroup className="rounded-t-md">
								{table
									.getAllColumns()
									.filter(column => column.getIsVisible())
									.map(column => (
										<col
											key={column.id}
											style={{
												width: `${column.getSize()}px`,
											}}
										/>
									))}
							</colgroup>
							<TableHeader className="sticky top-0 z-20 rounded-t-md border-b bg-background shadow-sm">
								{table.getHeaderGroups().map(headerGroup => (
									<TableRow key={headerGroup.id} className="rounded-t-md">
										{headerGroup.headers.map(header => {
											const isFilterOpen = openFilterId === header.id;
											const FilterComponent =
												header.column.columnDef.meta?.filter;

											return (
												<TableHead key={header.id} colSpan={header.colSpan}>
													{header.column.columnDef.id === "select" && (
														<Fragment>
															{flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
														</Fragment>
													)}
													{header.isPlaceholder ||
													header.column.columnDef.id === "select" ? null : (
														<div className="flex items-center justify-between">
															<Popover
																open={isFilterOpen}
																onOpenChange={open => {
																	if (!open) {
																		setOpenFilterId(null);
																	}
																}}
															>
																<PopoverTrigger asChild>
																	<Button
																		className={cn(
																			"truncate",
																			(header.column.getIsSorted() ||
																				header.column.getFilterValue()) &&
																				"flex justify-start text-red-500 hover:text-red-600",
																			!header.column.getCanSort() && "hidden"
																		)}
																		variant="ghost"
																		onClick={() =>
																			FilterComponent
																				? setOpenFilterId(header.id)
																				: header.column.toggleSorting(
																						header.column.getIsSorted() ===
																							"asc",
																						true
																					)
																		}
																		title={
																			header.column.columnDef.meta?.headerName
																		}
																	>
																		<span className="truncate">
																			{flexRender(
																				header.column.columnDef.meta
																					?.headerName,
																				header.getContext()
																			)}
																		</span>
																		<ArrowUpDown />
																	</Button>
																</PopoverTrigger>
																<PopoverContent className="p-0">
																	{FilterComponent && (
																		<FilterComponent
																			column={header.column}
																			table={table}
																		/>
																	)}
																</PopoverContent>
															</Popover>
														</div>
													)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableHeader>
							<TableBody className="relative z-10">
								{virtualRows.getVirtualItems().length && !isLoadingData ? (
									virtualRows.getVirtualItems().map(virtualRow => {
										const row = table.getRowModel().rows[virtualRow.index];

										if (!row || !row.original) return null;

										return (
											<TableRow
												key={
													row.original.repeatSettings?.currentCount
														? `${row.id}-${row.original.repeatSettings.currentCount}`
														: `${row.id}`
												}
												data-state={row.getIsSelected() && "selected"}
												className="p-0"
											>
												{row.getVisibleCells().map(cell => (
													<TableCell
														key={cell.id}
														className={
															cell.column.columnDef.id === "select"
																? ""
																: "py-2.5 text-break [&>div]:px-4"
														}
													>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext()
														)}
													</TableCell>
												))}
											</TableRow>
										);
									})
								) : (
									<TableRow>
										<TableCell
											colSpan={columns.length}
											className="h-24 text-center"
										>
											{isLoadingData ? (
												<SkeletonForOnlyTable />
											) : (
												"Sem resultados"
											)}
										</TableCell>
									</TableRow>
								)}
							</TableBody>
							<TableFooter className="sticky bottom-0 z-20 bg-background">
								{table.getFooterGroups().map(footerGroup => (
									<TableRow key={footerGroup.id}>
										{footerGroup.headers.map(header => {
											return (
												<TableHead
													key={header.id}
													className="[&>div]:px-4"
													colSpan={header.colSpan}
												>
													{header.isPlaceholder ? null : (
														<>
															{flexRender(
																header.column.columnDef.footer,
																header.getContext()
															)}
														</>
													)}
												</TableHead>
											);
										})}
									</TableRow>
								))}
							</TableFooter>
						</Table>
					</div>
				)}
			</div>
			<div className="flex items-center justify-between space-x-2 py-4">
				<div>
					<span className="text-muted-foreground text-sm">
						Mostrando {virtualRows.getVirtualItems().length} de{" "}
						{table.getRowModel().rows.length} linha
						{`${table.getRowModel().rows.length > 1 ? "s" : ""}`} selecionada
						{`${table.getRowModel().rows.length > 1 ? "s" : ""}`}
					</span>
				</div>
				<div>
					<span className="text-muted-foreground text-sm">
						{table.getFilteredSelectedRowModel().rows.length} de{" "}
						{table.getFilteredRowModel().rows.length} linha
						{`${table.getFilteredRowModel().rows.length > 1 ? "s" : ""}`}{" "}
						selecionada
						{`${table.getFilteredRowModel().rows.length > 1 ? "s" : ""}`}
					</span>
				</div>
			</div>
		</div>
	);
};
