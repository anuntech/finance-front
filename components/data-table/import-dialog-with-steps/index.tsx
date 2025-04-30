import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Form } from "@/components/ui/form";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CONFIGS } from "@/configs";
import { cn } from "@/lib/utils";
import { type ImportForm, importSchema } from "@/schemas/import";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { processValueWhenRouteIsTransactions } from "@/utils/import/_utils/process-value";
import { importFromCSV } from "@/utils/import/import-from-csv";
import { importFromExcel } from "@/utils/import/import-from-excel";
import { zodResolver } from "@hookform/resolvers/zod";
import type { Table } from "@tanstack/react-table";
import type { ColumnDef } from "@tanstack/react-table";
import { Import, Loader2 } from "lucide-react";
import { usePathname } from "next/navigation";
import {
	type Dispatch,
	type SetStateAction,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import type { ImportMutation } from "../import-dialog";
import { StepIndicator } from "./_components/step-indicator";
import { StepTransactionType } from "./_components/step-transaction-type";
import { StepUpload } from "./_components/step-upload";
import { StepConfirmation } from "./_components/step.confirmation";
import { useSteps } from "./_contexts/steps";
import { steps } from "./_data/steps";

interface ImportDialogWithStepsProps<TData> {
	importDialogIsOpen: boolean;
	setImportDialogIsOpen: Dispatch<SetStateAction<boolean>>;
	disabled?: boolean;
	columns: ColumnDef<TData>[];
	table: Table<TData>;
	importMutation: ImportMutation;
}
export const ImportDialogWithSteps = <TData,>({
	importDialogIsOpen,
	setImportDialogIsOpen,
	disabled,
	columns,
	table,
	importMutation,
}: ImportDialogWithStepsProps<TData>) => {
	const pathname = usePathname();

	const { functions } = CONFIGS.CONFIGURATION_ROUTES.find(
		route => route.path === pathname
	);

	const { step, setStep, transactionType, setTransactionType } = useSteps();

	const [progress, setProgress] = useState(0);

	const form = useForm<ImportForm>({
		resolver: zodResolver(importSchema),
		defaultValues: {
			import: null,
		},
	});

	const fileInput = form.watch("import");

	const onSubmit = async (data: ImportForm) => {
		// if (!form.formState.isValid) {
		// 	toast.error("Formulário inválido");

		// 	return;
		// }

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

				importMutation.mutate(fileImportedProcessed, {
					onSuccess: () => {
						form.reset();

						setStep(step => step + 1);
					},
					onError: () => {
						toast.error("Erro ao importar arquivo");

						setStep(step => step + 1);
					},
				});

				return;
			}

			importMutation.mutate(fileImported, {
				onSuccess: () => {
					form.reset();

					setStep(step => step + 1);
				},
				onError: () => {
					setStep(step => step + 1);
				},
			});
		} catch (error) {
			toast.error(`Erro ao importar arquivo: ${error.message}`);
		}
	};

	const stepsFiltered = useMemo(() => {
		return pathname !== "/transactions"
			? steps.filter(step => step.title !== "Escolha o tipo")
			: steps;
	}, [pathname]);

	useEffect(() => {
		setProgress(step * (100 / stepsFiltered.length));
	}, [step, stepsFiltered.length]);

	// biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
	const resetDialog = useCallback(() => {
		form.reset();
		importMutation.reset();
		setStep(1);
		setTransactionType(null);
	}, [form, setStep, setTransactionType]);

	useEffect(() => {
		if (!importDialogIsOpen) resetDialog();
	}, [importDialogIsOpen, resetDialog]);

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

			<DialogContent className="max-h-[80dvh] min-h-[80dvh] max-w-screen-xl overflow-y-auto">
				<Form {...form}>
					<form
						onSubmit={form.handleSubmit(onSubmit)}
						className="flex h-full flex-col"
					>
						<div>
							<DialogHeader>
								<DialogTitle>
									Importar{" "}
									{transactionType === TRANSACTION_TYPE.RECIPE && "receitas"}
									{transactionType === TRANSACTION_TYPE.EXPENSE && "despesas"}
								</DialogTitle>
								<DialogDescription>
									{pathname === "/transactions" && transactionType
										? `Importe suas ${
												transactionType === TRANSACTION_TYPE.RECIPE
													? "receitas"
													: "despesas"
											} de forma fácil e rápida.`
										: "Importe seus dados de forma fácil e rápida."}
								</DialogDescription>
							</DialogHeader>
							<Separator className="my-4" />
						</div>
						<div className="flex min-h-[calc(80dvh-10rem)] flex-col gap-4">
							<div className="flex flex-col gap-4">
								<div className="flex w-full items-center justify-around">
									{stepsFiltered.map((currentStep, index) => (
										<StepIndicator
											key={currentStep.title}
											title={currentStep.title}
											step={index + 1}
											isFilled={index + 1 <= step}
										/>
									))}
								</div>
								<Progress value={progress} className={cn("h-2")} />
							</div>
							<section className="h-full w-full self-stretch">
								{pathname === "/transactions" && (
									<>
										{step === 1 && <StepTransactionType />}
										{step === 2 && (
											<StepUpload table={table} columns={columns} />
										)}
										{step === 3 && (
											<StepConfirmation importMutation={importMutation} />
										)}
									</>
								)}
								{pathname !== "/transactions" && (
									<>
										{step === 1 && (
											<StepUpload table={table} columns={columns} />
										)}
										{step === 2 && (
											<StepConfirmation importMutation={importMutation} />
										)}
									</>
								)}
							</section>
							{((pathname === "/transactions" && step !== 1) ||
								(pathname !== "/transactions" && step)) && (
								<footer className="flex w-full flex-col items-center justify-between">
									<Separator className="my-4" />
									<div className="flex w-full items-center justify-end gap-2">
										<Button
											type="button"
											variant="outline"
											onClick={() => {
												if (step === stepsFiltered.length || step === 1) {
													setImportDialogIsOpen(false);
												}

												setStep(step => step - 1);
											}}
										>
											{step === stepsFiltered.length || step === 1
												? "Fechar"
												: "Voltar"}
										</Button>
										{step !== stepsFiltered.length && (
											<Button
												type={
													step === stepsFiltered.length - 1
														? "submit"
														: "button"
												}
												onClick={() => {
													if (step === stepsFiltered.length - 1) return;

													setStep(step + 1);
												}}
												disabled={
													importMutation.isPending ||
													importMutation.isSuccess ||
													!fileInput
												}
												className={cn(
													"w-full max-w-24",
													importMutation.isPending || importMutation.isSuccess
														? "max-w-36"
														: ""
												)}
											>
												{importMutation.isPending ||
												importMutation.isSuccess ? (
													<>
														<Loader2 className="h-4 w-4 animate-spin" />
														Importando...
													</>
												) : (
													"Importar"
												)}
											</Button>
										)}
										{step === stepsFiltered.length && (
											<Button type="button" onClick={() => resetDialog()}>
												Reiniciar
											</Button>
										)}
									</div>
								</footer>
							)}
						</div>
					</form>
				</Form>
			</DialogContent>
		</Dialog>
	);
};
