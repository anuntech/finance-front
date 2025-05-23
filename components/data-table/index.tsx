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
import type { DialogProps, IFormData, ITransferForm } from "@/types/form-data";
import { arrayMove } from "@/utils/array-move";
import { exportToCSV } from "@/utils/export/export-to-csv";
import { exportToExcel } from "@/utils/export/export-to-excel";
import { exportToPDF } from "@/utils/export/export-to-pdf";
import {
	DragDropContext,
	Draggable,
	type DropResult,
	Droppable,
} from "@hello-pangea/dnd";
import { useQueryClient } from "@tanstack/react-query";
import { useIsFetching } from "@tanstack/react-query";
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
import {
	ArrowUpDown,
	Check,
	CircleDollarSign,
	Download,
	Grid2X2Check,
	GripVertical,
	ListRestart,
	LoaderCircle,
	Pencil,
	RotateCcw,
	Search,
	Trash,
	X,
} from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
import {
	Fragment,
	type RefObject,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
} from "react";
import { DeleteDialog, type HandleDelete } from "../actions/delete-dialog";
import { EditDialog } from "../actions/edit-dialog";
import {
	PaymentConfirmDialog,
	type PaymentConfirmDialogType,
} from "../payment-confirm-dialog";
import { SkeletonForOnlyTable } from "../skeleton-table";
import { Button } from "../ui/button";
import { Input, InputContainer, InputIcon } from "../ui/input";
import { ScrollArea } from "../ui/scroll-area";
import type { ImportMutation } from "./import-dialog";
import { ImportDialogWithSteps } from "./import-dialog-with-steps";
import { StepsProvider } from "./import-dialog-with-steps/_contexts/steps";

interface Props<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	addComponentIsOpen: boolean;
	setAddComponentIsOpen: (isOpen: boolean) => void;
	addDialogProps?: DialogProps;
	importDialogIsOpen: boolean;
	setImportDialogIsOpen: (isOpen: boolean) => void;
	handleDelete: HandleDelete;
	details: {
		title: string;
		description: string;
		editManyTitle?: string;
		editManyDescription?: string;
	};
	FormData: IFormData;
	TransferForm?: ITransferForm;
	transactionType?: TRANSACTION_TYPE;
	setTransactionType?: (type: TRANSACTION_TYPE) => void;
	refMoreData?: (node: HTMLDivElement) => void;
	hasNextPage?: boolean;
	isLoadingData?: boolean;
	isLoadingMoreData?: boolean;
	isLoadingColumns?: boolean;
	isWithInfiniteScroll?: boolean;
	importMutation: ImportMutation;
	refImportTransactionsMutation?: RefObject<AbortController>;
}

export const DataTable = <TData, TValue>({
	data,
	columns,
	addComponentIsOpen,
	setAddComponentIsOpen,
	addDialogProps,
	importDialogIsOpen,
	setImportDialogIsOpen,
	handleDelete,
	details,
	FormData,
	TransferForm,
	transactionType,
	setTransactionType,
	refMoreData,
	hasNextPage,
	isLoadingData = false,
	// isLoadingMoreData = false,
	isLoadingColumns = false,
	isWithInfiniteScroll = false,
	importMutation,
	refImportTransactionsMutation,
}: Props<TData, TValue>) => {
	const pathname = usePathname();
	const categoryId = useSearchParams().get("categoryId");

	const { components, functions } = useMemo(
		() => CONFIGS.CONFIGURATION_ROUTES.find(route => route.path === pathname),
		[pathname]
	);

	if (!components) {
		throw new Error("Components not found!");
	}

	const { AddComponent } = components;

	if (!AddComponent) {
		throw new Error("AddComponent not found!");
	}

	// hooks
	const { search, setSearch } = useSearch();

	const queryClient = useQueryClient();
	const isFetching = useIsFetching();

	// table states
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 25,
	});
	const [columnSizing, setColumnSizing] = useState({});
	const [columnOrder, setColumnOrder] = useState<Array<string>>(() =>
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		columns.map(column => column.id ?? (column as any).accessorKey)
	);

	// states
	const [openFilterId, setOpenFilterId] = useState<string | null>(null);
	const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
	const [editManyComponentIsOpen, setEditManyComponentIsOpen] = useState(false);
	const [paymentConfirmDialogIsOpen, setPaymentConfirmDialogIsOpen] =
		useState(false);
	const [editManyTransactionType, setEditManyTransactionType] =
		useState<TRANSACTION_TYPE | null>(null);
	const [paymentConfirmDialogType, setPaymentConfirmDialogType] =
		useState<PaymentConfirmDialogType | null>(null);
	const [searchFilter, setSearchFilter] = useState(search);

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		onColumnSizingChange: setColumnSizing,
		onColumnOrderChange: setColumnOrder,
		columnResizeMode: "onChange",
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		getRowId: (row: any) => {
			if (row.frequency && row.frequency !== FREQUENCY.DO_NOT_REPEAT) {
				return `${row.id}-${row.repeatSettings.currentCount}`;
			}

			return row.id;
		},
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
			pagination,
			columnSizing,
			columnOrder,
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

	const handleDragEnd = useCallback(
		(result: DropResult) => {
			if (!result.destination) return;

			const { source, destination } = result;

			const visibleColumnsIds = table
				.getAllLeafColumns()
				.filter(column => column.getCanHide())
				.map(column => column.id);

			const oldVisibleColumnId = visibleColumnsIds[source.index];
			const newVisibleColumnId = visibleColumnsIds[destination.index];

			const allColumnsIds = table.getAllLeafColumns().map(column => column.id);

			const oldAllColumnIndex = allColumnsIds.indexOf(oldVisibleColumnId);
			const newAllColumnIndex = allColumnsIds.indexOf(newVisibleColumnId);

			const newAllOrder = arrayMove(
				allColumnsIds,
				oldAllColumnIndex,
				newAllColumnIndex
			);

			table.setColumnOrder(newAllOrder);
		},
		[table]
	);

	const saveTableSettings = useCallback(() => {
		if (isLoading) return;

		const settings = {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
			pagination,
			columnSizing,
			columnOrder,
		};

		const workspaceId = sessionStorage.getItem("workspaceId");

		localStorage.setItem(
			`workspaceId-${workspaceId}-table-settings-${pathname}`,
			JSON.stringify(settings)
		);
	}, [
		pathname,
		sorting,
		columnFilters,
		columnVisibility,
		rowSelection,
		globalFilter,
		pagination,
		columnSizing,
		columnOrder,
		isLoading,
	]);

	const loadTableSettings = useCallback(() => {
		const workspaceId = sessionStorage.getItem("workspaceId");

		const savedSettings = localStorage.getItem(
			`workspaceId-${workspaceId}-table-settings-${pathname}`
		);

		if (!savedSettings) return;

		try {
			const settings = JSON.parse(savedSettings);

			if (settings.sorting) setSorting(settings.sorting);
			// if (settings.columnFilters) setColumnFilters(settings.columnFilters);
			if (settings.columnVisibility)
				setColumnVisibility(settings.columnVisibility);
			// if (settings.rowSelection) setRowSelection(settings.rowSelection);
			// if (settings.globalFilter) setGlobalFilter(settings.globalFilter);
			if (settings.columnSizing) setColumnSizing(settings.columnSizing);
			if (settings.columnOrder) setColumnOrder(settings.columnOrder);
			// if (settings.pagination) setPagination(settings.pagination);
		} catch (error) {
			console.error("Erro ao carregar configurações da tabela:", error);
		}
	}, [pathname]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		if (isLoading) return;

		loadTableSettings();
	}, [pathname, isLoading]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	useEffect(() => {
		saveTableSettings();
	}, [
		sorting,
		columnFilters,
		columnVisibility,
		rowSelection,
		globalFilter,
		columnSizing,
		columnOrder,
		pagination,
		pathname,
		isLoading,
	]);

	useEffect(() => {
		if (!isWithInfiniteScroll || data?.length === 0) return;

		table.setPagination({
			pageIndex: 0,
			pageSize: data.length,
		});
	}, [isWithInfiniteScroll, data.length, table]);

	const invalidateQueries = useCallback(() => {
		queryClient.invalidateQueries();
	}, [queryClient]);

	const [rowsPerPage, setRowsPerPage] = useState(50);
	const tableContainerRef = useRef(null);

	const updateRowsPerPage = useCallback(() => {
		const containerHeight = tableContainerRef.current.offsetHeight;
		const rowHeight = 49;
		const headerHeight = 40;
		const footerHeight = 40;
		const availableHeight = containerHeight - headerHeight - footerHeight;
		const count = Math.floor(availableHeight / rowHeight);

		setRowsPerPage(count > 0 ? count : 1);
	}, []);

	useEffect(() => {
		if (!data || !tableContainerRef.current) return;

		updateRowsPerPage();

		window.addEventListener("resize", updateRowsPerPage);

		return () => window.removeEventListener("resize", updateRowsPerPage);
	}, [data, updateRowsPerPage]);

	const dataRows = table.getRowModel().rows.slice(0, rowsPerPage);
	const emptyRowsCount = Math.max(0, rowsPerPage - dataRows.length);
	const halfEmptyRowsCount = Math.max(
		0,
		Math.ceil(rowsPerPage / 2) - dataRows.length
	);

	const cleanFilterAndSearchAndSorting = useCallback(() => {
		setColumnFilters([]);
		setGlobalFilter("");
		setSorting([]);
	}, []);

	return (
		<div className="flex h-full min-h-[calc(100vh-6rem)] w-full flex-col justify-between gap-2">
			<div>
				<div className="flex items-center justify-between gap-4 py-4">
					{table.getSelectedRowModel().rows.length === 0 && (
						<>
							<div className="flex items-center gap-2">
								<InputContainer>
									<InputIcon>
										<Search />
									</InputIcon>
									<Input
										className="h-9"
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
										disabled={isLoadingColumns}
										isWithIcon
									/>
								</InputContainer>
								<Button
									size="sm"
									variant="outline"
									title="Buscar dados"
									onClick={() => invalidateQueries()}
									disabled={isLoading}
								>
									{isFetching === 0 && <RotateCcw />}
									{isFetching > 0 && <LoaderCircle className="animate-spin" />}
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
									TransferForm={TransferForm}
									dialogProps={addDialogProps}
									disabled={isLoading}
								/>
								<Button
									size="sm"
									variant="outline"
									title="Limpar ordenação e filtros"
									onClick={cleanFilterAndSearchAndSorting}
									disabled={isLoading}
								>
									<ListRestart />
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											size="sm"
											variant="outline"
											className="ml-auto"
											title="Visualização"
											disabled={isLoading}
										>
											<Grid2X2Check />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent align="end">
										<DragDropContext onDragEnd={handleDragEnd}>
											<Droppable
												droppableId="columns"
												type="list"
												direction="vertical"
											>
												{provided => {
													const columnsCanHide = table
														.getAllLeafColumns()
														.filter(column => column.getCanHide());

													return (
														<ScrollArea
															className={cn(
																"h-96",
																columnsCanHide.length < 13 && "h-full"
															)}
														>
															<article
																{...provided.droppableProps}
																ref={provided.innerRef}
															>
																{columnsCanHide.map((column, index) => {
																	return (
																		<Draggable
																			key={
																				column.id ??
																				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
																				(column as any).accessorKey
																			}
																			draggableId={
																				column.id ??
																				// biome-ignore lint/suspicious/noExplicitAny: <explanation>
																				(column as any).accessorKey
																			}
																			index={index}
																		>
																			{provided => (
																				<div
																					ref={provided.innerRef}
																					{...provided.draggableProps}
																				>
																					<DropdownMenuCheckboxItem
																						className="flex items-center justify-between gap-2 capitalize"
																						checked={column.getIsVisible()}
																						onCheckedChange={value =>
																							column.toggleVisibility(!!value)
																						}
																					>
																						<span>
																							{
																								column.columnDef.meta
																									?.headerName
																							}
																						</span>
																						<button
																							type="button"
																							className="h-4 w-4 cursor-move"
																							{...provided.dragHandleProps}
																						>
																							<GripVertical className="h-4 w-4 text-muted-foreground" />
																						</button>
																					</DropdownMenuCheckboxItem>
																				</div>
																			)}
																		</Draggable>
																	);
																})}
																{provided.placeholder}
															</article>
														</ScrollArea>
													);
												}}
											</Droppable>
										</DragDropContext>
									</DropdownMenuContent>
								</DropdownMenu>
								<StepsProvider>
									<ImportDialogWithSteps
										importDialogIsOpen={importDialogIsOpen}
										setImportDialogIsOpen={setImportDialogIsOpen}
										disabled={isLoading}
										columns={columns}
										table={table}
										importMutation={importMutation}
										refImportTransactionsMutation={
											refImportTransactionsMutation
										}
									/>
								</StepsProvider>
							</div>
						</>
					)}
					{table.getSelectedRowModel().rows.length > 0 && (
						<div
							className={cn(
								"flex h-full max-h-9 w-full justify-between rounded-md border"
							)}
						>
							<div className="mx-4 flex items-center gap-2">
								<span className="text-muted-foreground text-sm">
									{table.getFilteredSelectedRowModel().rows.length} de{" "}
									{table.getFilteredRowModel().rows.length} linha
									{`${table.getFilteredRowModel().rows.length > 1 ? "s" : ""}`}{" "}
									selecionada
									{`${table.getFilteredRowModel().rows.length > 1 ? "s" : ""}`}
								</span>
							</div>
							<div className="mx-2 flex items-center">
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											size="sm"
											variant="outline"
											title="Mudar o status em massa"
											className="scale-75 self-end"
											disabled={
												table.getSelectedRowModel().rows.length === 0 ||
												pathname !== "/transactions" ||
												(isTransactionsWithRecipeTypeSelected &&
													isTransactionsWithExpenseTypeSelected)
											}
										>
											<CircleDollarSign />
										</Button>
									</DropdownMenuTrigger>
									<DropdownMenuContent>
										<DropdownMenuItem>
											<button
												type="button"
												className="flex w-full items-center justify-start gap-2"
												onClick={() => {
													setPaymentConfirmDialogType("pay-actions");
													setPaymentConfirmDialogIsOpen(true);
													setEditManyTransactionType(
														isTransactionsWithRecipeTypeSelected
															? TRANSACTION_TYPE.RECIPE
															: TRANSACTION_TYPE.EXPENSE
													);
												}}
											>
												<Check />
												{isTransactionsWithExpenseTypeSelected
													? "Pagar"
													: "Receber"}
											</button>
										</DropdownMenuItem>
										<DropdownMenuItem>
											<button
												type="button"
												className="flex w-full items-center justify-start gap-2 [&:disabled]:line-through [&:disabled]:opacity-50"
												onClick={() => {
													setPaymentConfirmDialogType("not-pay-actions");
													setPaymentConfirmDialogIsOpen(true);
													setEditManyTransactionType(
														isTransactionsWithRecipeTypeSelected
															? TRANSACTION_TYPE.RECIPE
															: TRANSACTION_TYPE.EXPENSE
													);
												}}
											>
												<X />
												{isTransactionsWithExpenseTypeSelected
													? "Não paga"
													: "Não recebida"}
											</button>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
								<Button
									size="sm"
									variant="outline"
									title="Editar em massa"
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
										table.getSelectedRowModel().rows.length === 0 ||
										pathname !== "/transactions" ||
										(isTransactionsWithRecipeTypeSelected &&
											isTransactionsWithExpenseTypeSelected)
									}
								>
									<Pencil />
								</Button>
								<Button
									size="sm"
									variant="outline"
									title="Remover em massa"
									className="scale-75 self-end"
									onClick={() => {
										setDeleteDialogIsOpen(true);
									}}
									disabled={table.getSelectedRowModel().rows.length === 0}
								>
									<Trash />
								</Button>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<Button
											size="sm"
											className="scale-75 self-end"
											variant="outline"
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
													exportToExcel({
														table,
														pathname,
														queryClient,
														columns,
													})
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
								details={{
									title: details.editManyTitle || "Editar",
									description:
										details.editManyDescription ||
										"Editar vários itens selecionados",
								}}
								FormData={FormData}
								id={table
									.getFilteredSelectedRowModel()
									.rows.filter(
										row => row.original.type === editManyTransactionType
									)
									.map(row => row.id)
									.join(",")}
								transactionType={editManyTransactionType}
							/>
							<PaymentConfirmDialog
								isPaymentConfirmDialogOpen={paymentConfirmDialogIsOpen}
								setIsPaymentConfirmDialogOpen={setPaymentConfirmDialogIsOpen}
								id={table
									.getFilteredSelectedRowModel()
									.rows.filter(
										row => row.original.type === editManyTransactionType
									)
									.map(row => row.original.id)
									.join(",")}
								type={paymentConfirmDialogType}
								editType="many"
							/>
							<DeleteDialog
								deleteDialogIsOpen={deleteDialogIsOpen}
								setDeleteDialogIsOpen={setDeleteDialogIsOpen}
								handleDelete={handleDelete}
								id={table
									.getFilteredSelectedRowModel()
									.rows.map(row => row.id)
									.join(",")}
							/>
						</div>
					)}
				</div>
				{isLoadingColumns && <SkeletonForOnlyTable />}
				{!isLoadingColumns && (
					<div className="rounded-md border">
						<Table
							containerClassName={cn(
								"min-h-[calc(100vh-7.5rem)] h-full max-h-[calc(100vh-7.5rem)]",
								!isWithInfiniteScroll &&
									"min-h-[calc(100vh-12rem)] h-full max-h-[calc(100vh-12rem)]",
								categoryId &&
									"min-h-[calc(100vh-16rem)] h-full max-h-[calc(100vh-16rem)]"
							)}
							className="w-full table-fixed"
							containerRef={tableContainerRef}
						>
							<colgroup className="rounded-t-md">
								{table.getHeaderGroups().flatMap(headerGroup =>
									headerGroup.headers.map(header => (
										<col
											key={
												// biome-ignore lint/suspicious/noExplicitAny: <explanation>
												header.column.id ?? (header.column as any).accessorKey
											}
											style={{
												width: `${header.column.getSize()}px`,
											}}
										/>
									))
								)}
							</colgroup>
							<TableHeader className="group sticky top-0 z-20 rounded-t-md border-b bg-background shadow-sm">
								{table.getHeaderGroups().map(headerGroup => (
									<TableRow
										key={headerGroup.id}
										className="group/row rounded-t-md"
									>
										{headerGroup.headers.map(header => {
											const isFilterOpen = openFilterId === header.id;
											const FilterComponent =
												header.column.columnDef.meta?.filter;

											return (
												<TableHead
													key={header.id}
													colSpan={header.colSpan}
													className={cn(
														header.column.columnDef.id === "select" &&
															"sticky left-0 z-10 bg-white transition-colors group-hover/row:bg-muted [&>button]:flex [&>button]:bg-white"
													)}
												>
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
																		size="sm"
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
							<TableBody className="group z-10 h-full">
								{table.getRowModel().rows.length > 0 &&
									!isLoadingData &&
									table.getRowModel().rows.map(row => {
										return (
											<TableRow
												key={
													row.original.repeatSettings?.currentCount
														? `${row.id}-${row.original.repeatSettings.currentCount}`
														: `${row.id}`
												}
												data-state={row.getIsSelected() && "selected"}
												className="group/row p-0"
											>
												{row.getVisibleCells().map(cell => (
													<TableCell
														key={cell.id}
														className={cn(
															cell.column.columnDef.id !== "actions" &&
																cell.column.columnDef.id !== "select" &&
																"text-break [&>div]:px-4",
															cell.column.columnDef.id === "select" &&
																"sticky left-0 z-10 bg-white transition-colors group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted [&>div>button]:bg-white",
															cell.column.columnDef.id === "actions" &&
																"sticky right-0 z-10 bg-white transition-colors group-hover/row:bg-muted group-data-[state=selected]/row:bg-muted [&>div>button]:bg-white group-hover/row:[&>div>button]:bg-muted group-data-[state=selected]/row:[&>div>button]:bg-muted"
														)}
													>
														{flexRender(
															cell.column.columnDef.cell,
															cell.getContext()
														)}
													</TableCell>
												))}
											</TableRow>
										);
									})}
								{!isLoadingData &&
									hasNextPage &&
									table.getRowModel().rows.length > 0 && (
										<TableRow
											className={cn(
												"sticky left-0 h-[49px] border-none p-0 hover:bg-transparent"
											)}
											ref={refMoreData}
										>
											<TableCell colSpan={columns.length}>
												<span className="-mx-4 sticky left-0 px-4">
													<span className="inline-block pr-1 align-middle">
														<LoaderCircle className="animate-spin" />
													</span>
													<span className="inline-block pl-1 align-middle">
														Estamos buscando mais dados...
													</span>
												</span>
											</TableCell>
										</TableRow>
									)}
								{Array.from({ length: emptyRowsCount }).map((_, index) => (
									<TableRow
										key={`empty-row-${
											// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
											index
										}`}
										className={cn(
											"h-[49px] border-none p-0 hover:bg-transparent"
										)}
									>
										<TableCell
											colSpan={columns.length}
											className={cn(
												table.getRowModel().rows.length === 0 &&
													index === halfEmptyRowsCount &&
													"text-center"
											)}
										>
											{table.getRowModel().rows.length === 0 &&
												index === halfEmptyRowsCount && (
													<div className="fixed w-full">
														<span className="flex w-full items-center justify-center gap-2">
															{isLoadingData ? (
																<>
																	<LoaderCircle className="animate-spin" />
																	Estamos buscando os seus dados...
																</>
															) : (
																"Sem resultados"
															)}
														</span>
													</div>
												)}
										</TableCell>
									</TableRow>
								))}
							</TableBody>
							{table.getSelectedRowModel().rows.length > 0 && (
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
							)}
						</Table>
					</div>
				)}
			</div>
			{!isWithInfiniteScroll && (
				<div className="flex items-center justify-between space-x-2 py-4">
					<div>
						<span className="text-muted-foreground text-sm">
							Página{" "}
							{table.getState().pagination.pageIndex +
								(table.getRowModel().rows?.length && 1)}{" "}
							de {table.getPageCount()}
						</span>
					</div>
					<div className="space-x-2">
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.previousPage()}
							disabled={!table.getCanPreviousPage()}
						>
							Anterior
						</Button>
						<Button
							variant="outline"
							size="sm"
							onClick={() => table.nextPage()}
							disabled={!table.getCanNextPage()}
						>
							Próximo
						</Button>
					</div>
				</div>
			)}
		</div>
	);
};
