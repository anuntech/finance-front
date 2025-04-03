"use client";

import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "@/components/ui/dialog";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { CONFIGS } from "@/configs";
import { cn } from "@/lib/utils";
import { type ImportForm, importSchema } from "@/schemas/import";
import { processValueWhenRouteIsTransactions } from "@/utils/import/_utils/process-value";
import { importFromCSV } from "@/utils/import/import-from-csv";
import { importFromExcel } from "@/utils/import/import-from-excel";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseMutationResult } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Import, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
export type ImportMutation = UseMutationResult<any, Error, any, unknown>;

interface ImportDialogProps {
	importDialogIsOpen: boolean;
	setImportDialogIsOpen: Dispatch<SetStateAction<boolean>>;
	importMutation: ImportMutation;
	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	columns: ColumnDef<any>[];
	disabled?: boolean;
}

export const ImportDialog = ({
	importDialogIsOpen,
	setImportDialogIsOpen,
	importMutation,
	columns,
	disabled = false,
}: ImportDialogProps) => {
	const pathname = usePathname();

	const { functions } = CONFIGS.CONFIGURATION_ROUTES.find(
		route => route.path === pathname
	);

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
			// biome-ignore lint/suspicious/noExplicitAny: <explanation>
			let fileImported: Array<any> = [];

			if (
				file.type ===
				"application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
			) {
				fileImported = await importFromExcel(file, columns);
			}

			if (file.type === "text/csv") {
				fileImported = await importFromCSV(file, columns);
			}

			if (fileImported.length === 0) throw new Error("Nenhum dado encontrado");

			if (pathname === "/transactions") {
				const fileImportedProcessed = processValueWhenRouteIsTransactions({
					values: fileImported,
				});

				console.log(fileImportedProcessed);

				// for (const row of fileImported) {
				// 	importMutation.mutate(row, {
				// 		onSuccess: () => {
				// 			importMutation.reset();
				// 			form.reset();

				// 			setImportDialogIsOpen(false);
				// 		},
				// 	});
				// }

				return;
			}

			importMutation.mutate(fileImported, {
				onSuccess: () => {
					importMutation.reset();
					form.reset();

					setImportDialogIsOpen(false);
				},
			});
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
					disabled={!functions.import || disabled}
				>
					<Import />
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Importar</DialogTitle>
					<DialogDescription>
						Importe um arquivo <strong>CSV</strong> ou <strong>Excel</strong>{" "}
						para o aplicativo
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
									<FormLabel>Arquivo CSV ou Excel</FormLabel>
									<FormControl>
										<Input
											type="file"
											accept=".csv, .xlsx"
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
								disabled={importMutation.isPending || importMutation.isSuccess}
							>
								Cancelar
							</Button>
							<Button
								type="submit"
								disabled={
									!form.formState.isValid ||
									importMutation.isPending ||
									importMutation.isSuccess
								}
								className={cn(
									"w-full max-w-24",
									importMutation.isPending || importMutation.isSuccess
										? "max-w-32"
										: ""
								)}
							>
								{importMutation.isPending || importMutation.isSuccess ? (
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
