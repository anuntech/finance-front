"use client";

import {
	DropdownMenu,
	DropdownMenuCheckboxItem,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { DialogProps, IFormData } from "@/types/form-data";
import { exportToCSV } from "@/utils/export-to-csv";
import { exportToExcel } from "@/utils/export-to-excel";
import { exportToPDF } from "@/utils/export-to-pdf";
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
	Download,
	Grid2X2Check,
	ListRestart,
	RotateCcw,
	Search,
} from "lucide-react";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
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

	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 3,
	});
	const [columnSizing, setColumnSizing] = useState({});

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
		columnResizeMode: "onChange",
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		// biome-ignore lint/suspicious/noExplicitAny: <explanation>
		getRowId: (row: any) => row.id,
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
			pagination,
			columnSizing,
		},
	});

	useEffect(() => {
		const updatePageSize = () => {
			const ITEM_HEIGHT = 72.5;
			const HEIGHT_DISCOUNT = 300;
			const newPageSize = Math.floor(
				(window.innerHeight - HEIGHT_DISCOUNT) / ITEM_HEIGHT
			);
			if (newPageSize > 0)
				setPagination(prev => ({ ...prev, pageSize: newPageSize }));
		};
		updatePageSize();
		window.addEventListener("resize", updatePageSize);
		return () => window.removeEventListener("resize", updatePageSize);
	}, []);

	return (
		<div className="flex min-h-[calc(100vh-6.5rem)] w-full flex-col justify-between gap-2">
			<div>
				<div className="flex items-center justify-between gap-4 py-4">
					<div className="flex items-center gap-2">
						<div className="relative w-full max-w-sm">
							<Search className="-translate-y-1/2 absolute top-1/2 left-3 text-muted-foreground" />
							<Input
								placeholder="Procurar..."
								value={globalFilter}
								onChange={event => setGlobalFilter(event.target.value)}
								className="pl-10"
							/>
						</div>
						<Button
							variant="outline"
							title="Limpar ordenação"
							onClick={() => setSorting([])}
						>
							<ListRestart />
						</Button>
						<Button
							variant="outline"
							title="Limpar seleção"
							onClick={() => setRowSelection({})}
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
						/>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<Button
									variant="outline"
									className="ml-auto"
									title="Visualização"
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
												{column.columnDef.header as string}
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
										!functions.export
									}
								>
									<Download />
								</Button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align="end">
								<DropdownMenuItem>
									<button
										type="button"
										onClick={() => exportToExcel(table)}
										className="w-full text-left"
									>
										Excel
									</button>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<button
										type="button"
										onClick={() => exportToCSV(table, columns)}
										className="w-full text-left"
									>
										CSV
									</button>
								</DropdownMenuItem>
								<DropdownMenuItem>
									<button
										type="button"
										onClick={() => exportToPDF(table, columns)}
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
						/>
					</div>
				</div>
				<div className="rounded-md border">
					<Table className="w-full table-fixed">
						<colgroup>
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
						<TableHeader>
							{table.getHeaderGroups().map(headerGroup => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map(header => {
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
														<Button
															className={
																header.column.getCanSort()
																	? header.column.getIsSorted()
																		? "flex justify-start text-red-500 hover:text-red-600"
																		: ""
																	: "hidden"
															}
															variant="ghost"
															onClick={() =>
																header.column.toggleSorting(
																	header.column.getIsSorted() === "asc",
																	true
																)
															}
														>
															{flexRender(
																header.column.columnDef.header,
																header.getContext()
															)}
															<ArrowUpDown />
														</Button>
													</div>
												)}
											</TableHead>
										);
									})}
								</TableRow>
							))}
						</TableHeader>
						<TableBody>
							{table.getRowModel().rows?.length ? (
								table.getRowModel().rows.map(row => (
									<TableRow
										key={row.id}
										data-state={row.getIsSelected() && "selected"}
										className="p-0"
									>
										{row.getVisibleCells().map(cell => (
											<TableCell
												key={cell.id}
												className={
													cell.column.columnDef.id === "select"
														? ""
														: "py-2.5 [&>div]:px-4 "
												}
											>
												{flexRender(
													cell.column.columnDef.cell,
													cell.getContext()
												)}
											</TableCell>
										))}
									</TableRow>
								))
							) : (
								<TableRow>
									<TableCell
										colSpan={columns.length}
										className="h-24 text-center"
									>
										Sem resultados
									</TableCell>
								</TableRow>
							)}
						</TableBody>
						<TableFooter>
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
			</div>
			<div className="flex items-center justify-between space-x-2 py-4">
				<div>
					<span className="text-muted-foreground text-sm">
						Página{" "}
						{table.getState().pagination.pageIndex +
							(table.getRowModel().rows?.length && 1)}{" "}
						de {table.getPageCount()}
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
		</div>
	);
};
