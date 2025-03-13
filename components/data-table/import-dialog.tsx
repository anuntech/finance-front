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
import { importFromCSV } from "@/utils/import-from-csv";
import { zodResolver } from "@hookform/resolvers/zod";
import type { UseMutationResult } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import { Import, Loader2 } from "lucide-react";
import { usePathname, useSearchParams } from "next/navigation";
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
}

export const ImportDialog = ({
	importDialogIsOpen,
	setImportDialogIsOpen,
	importMutation,
	columns,
}: ImportDialogProps) => {
	const pathname = usePathname();
	const searchParams = useSearchParams();
	const categoryId = searchParams.get("categoryId");

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
			const fileImported = await importFromCSV(file, columns);

			if (fileImported.length === 0)
				throw new Error("Nenhum resultado encontrado");

			if (pathname === "/config/accounts" || categoryId) {
				for (const item of fileImported) {
					importMutation.mutate(item, {
						onSuccess: () => {
							importMutation.reset();
							form.reset();

							setImportDialogIsOpen(false);
						},
					});
				}
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
					disabled={!functions.import}
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
