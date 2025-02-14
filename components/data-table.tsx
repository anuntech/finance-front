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
import { cn } from "@/lib/utils";
import { type ImportForm, importSchema } from "@/schemas/import";
import type { IFormData } from "@/types/form-data";
import { exportToCSV } from "@/utils/export-to-csv";
import { exportToExcel } from "@/utils/export-to-excel";
import { exportToPDF } from "@/utils/export-to-pdf";
import { importFromCSV } from "@/utils/import-from-csv";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseMutationResult } from "@tanstack/react-query";
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
	Import,
	ListRestart,
	Loader2,
	Plus,
	Search,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "./ui/form";
import { Input } from "./ui/input";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type AddMutation = UseMutationResult<any, Error, any, unknown>;

interface AddDialogProps {
	addDialogIsOpen: boolean;
	setAddDialogIsOpen: (isOpen: boolean) => void;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	addMutation: AddMutation;
}

const AddDialog = ({
	addDialogIsOpen,
	setAddDialogIsOpen,
	dialog,
	FormData,
	addMutation,
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
				<FormData
					type="add"
					setOpenDialog={setAddDialogIsOpen}
					addMutation={addMutation}
				/>
			</DialogContent>
		</Dialog>
	);
};

interface ImportDialogProps {
	importDialogIsOpen: boolean;
	setImportDialogIsOpen: (isOpen: boolean) => void;
	addMutation: AddMutation;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	columns: ColumnDef<any>[];
}

const ImportDialog = ({
	importDialogIsOpen,
	setImportDialogIsOpen,
	addMutation,
	columns,
}: ImportDialogProps) => {
	const form = useForm<ImportForm>({
		resolver: zodResolver(importSchema),
		defaultValues: {
			import: null,
		},
	});

	const onSubmit = async (data: ImportForm) => {
		if (!form.formState.isValid) {
			toast.error("Formulário inválido");

			return;
		}

		const files = data.import as FileList;

		if (files.length === 0) {
			toast.error("Nenhum arquivo selecionado");

			return;
		}

		const [file] = files;

		try {
			const fileImported = await importFromCSV(file, columns);

			if (fileImported.length === 0)
				throw new Error("Nenhum resultado encontrado");

			for (const item of fileImported) {
				addMutation.mutate(item, {
					onSuccess: () => {
						addMutation.reset();
						form.reset();

						setImportDialogIsOpen(false);
					},
				});
			}
		} catch (error) {
			toast.error(`Erro ao importar arquivo: ${error.message}`);
		}
	};

	return (
		<Dialog
			open={importDialogIsOpen}
			onOpenChange={importDialogIsOpen => {
				if (!importDialogIsOpen) {
					setImportDialogIsOpen(false);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="ml-auto"
					title="Importar"
					onClick={() => setImportDialogIsOpen(true)}
				>
					<Import />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Importar</DialogTitle>
					<DialogDescription>
						Importe um arquivo <strong>CSV</strong> para o aplicativo
					</DialogDescription>
				</DialogHeader>
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex flex-col gap-4"
					>
						<FormField
							control={form.control}
							name="import"
							render={() => (
								<FormItem className="w-full">
									<FormLabel>Arquivo CSV</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept=".csv"
											placeholder="Nome da conta"
											{...form.register("import")}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<div className="flex w-full items-center justify-end gap-2">
							<Button
								variant="outline"
								type="button"
								onClick={() => setImportDialogIsOpen(false)}
								className="w-full max-w-24"
								disabled={addMutation.isPending || addMutation.isSuccess}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={
									!form.formState.isValid ||
									addMutation.isPending ||
									addMutation.isSuccess
								}
								className={cn(
									"w-full max-w-24",
									addMutation.isPending || addMutation.isSuccess
										? "max-w-32"
										: ""
								)}
							>
								{addMutation.isPending || addMutation.isSuccess ? (
									<>
										<Loader2 className="h-4 w-4 animate-spin" />
										Salvando...
									</>
								) : (
									"Salvar"
								)}
							</Button>
						</div>
					</form>
				</Form>
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
	importDialogIsOpen: boolean;
	setImportDialogIsOpen: (isOpen: boolean) => void;
	addMutation: AddMutation;
}

export const DataTable = <TData, TValue>({
	data,
	columns,
	addDialogIsOpen,
	setAddDialogIsOpen,
	dialog,
	FormData,
	importDialogIsOpen,
	setImportDialogIsOpen,
	addMutation,
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
							addMutation={addMutation}
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
						<ImportDialog
							importDialogIsOpen={importDialogIsOpen}
							setImportDialogIsOpen={setImportDialogIsOpen}
							addMutation={addMutation}
							columns={columns}
						/>
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
