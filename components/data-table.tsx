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
	TableHead,
	TableHeader,
	TableRow,
} from "@/components/ui/table";
import type { IFormData } from "@/types/form-data";
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
	Plus,
	Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Input } from "./ui/input";

interface AddDialogProps {
	addDialogIsOpen: boolean;
	setAddDialogIsOpen: (isOpen: boolean) => void;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
}

const AddDialog = ({
	addDialogIsOpen,
	setAddDialogIsOpen,
	dialog,
	FormData,
}: AddDialogProps) => {
	return (
		<Dialog
			open={addDialogIsOpen}
			onOpenChange={addDialogIsOpen => {
				if (!addDialogIsOpen) {
					setAddDialogIsOpen(false);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					className="ml-auto rounded-lg bg-green-500 hover:bg-green-600"
					onClick={() => setAddDialogIsOpen(true)}
				>
					<Plus /> Adicionar
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{dialog.title}</DialogTitle>
					<DialogDescription>{dialog.description}</DialogDescription>
				</DialogHeader>
				<FormData type="add" setOpenDialog={setAddDialogIsOpen} />
			</DialogContent>
		</Dialog>
	);
};

interface Props<TData, TValue> {
	columns: ColumnDef<TData, TValue>[];
	data: TData[];
	addDialogIsOpen: boolean;
	setAddDialogIsOpen: (isOpen: boolean) => void;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
}

export const DataTable = <TData, TValue>({
	data,
	columns,
	addDialogIsOpen,
	setAddDialogIsOpen,
	dialog,
	FormData,
}: Props<TData, TValue>) => {
	const [sorting, setSorting] = useState<SortingState>([]);
	const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
	const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
	const [rowSelection, setRowSelection] = useState({});
	const [globalFilter, setGlobalFilter] = useState("");
	const [pagination, setPagination] = useState({
		pageIndex: 0,
		pageSize: 3,
	});

	const table = useReactTable({
		data,
		columns,
		onSortingChange: setSorting,
		onColumnFiltersChange: setColumnFilters,
		onColumnVisibilityChange: setColumnVisibility,
		onRowSelectionChange: setRowSelection,
		onGlobalFilterChange: setGlobalFilter,
		onPaginationChange: setPagination,
		getCoreRowModel: getCoreRowModel(),
		getPaginationRowModel: getPaginationRowModel(),
		getSortedRowModel: getSortedRowModel(),
		getFilteredRowModel: getFilteredRowModel(),
		state: {
			sorting,
			columnFilters,
			columnVisibility,
			rowSelection,
			globalFilter,
			pagination,
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
					</div>
					<div className="flex items-center gap-2">
						<AddDialog
							addDialogIsOpen={addDialogIsOpen}
							setAddDialogIsOpen={setAddDialogIsOpen}
							dialog={dialog}
							FormData={FormData}
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
								<Button variant="outline" className="ml-auto" title="Exportar">
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
					</div>
				</div>
				<div className="rounded-md border">
					<Table>
						<TableHeader>
							{table.getHeaderGroups().map(headerGroup => (
								<TableRow key={headerGroup.id}>
									{headerGroup.headers.map(header => {
										return (
											<TableHead key={header.id}>
												{header.isPlaceholder ? null : (
													<Button
														className={
															header.column.getCanSort()
																? header.column.getIsSorted()
																	? "text-red-500 hover:text-red-600"
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
									>
										{row.getVisibleCells().map(cell => (
											<TableCell key={cell.id}>
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
						Total de {table.getFilteredRowModel().rows.length} resultados
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
