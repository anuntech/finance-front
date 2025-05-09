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
import { StepMap } from "./_components/step-map";
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

	const { step, setStep, transactionType, setTransactionType, headers } =
		useSteps();

	const [isLoading, setIsLoading] = useState(false);
	const [progress, setProgress] = useState(0);

	const form = useForm<ImportForm>({
		resolver: zodResolver(importSchema),
		defaultValues: {
			import: null,
			columnsToMap: [],
		},
	});

	const fileInput = form.watch("import");

	const onSubmit = async (data: ImportForm) => {
		if (Object.keys(form.formState.errors).length > 0) {
			toast.error("Formulário inválido!");

			return;
		}

		const files = data.import as FileList;
		const columnsToMap = data.columnsToMap;

		if (files.length === 0) {
			toast.error("Nenhum arquivo selecionado");

			return;
		}

		const [file] = files;

		const columnsToMapMapped = columnsToMap.map(columnToMap => ({
			key:
				headers.find(header => header.header === columnToMap.key)
					?.accessorKey || columnToMap.key,
			keyToMap: columnToMap.keyToMap,
			isCustomField: columnToMap.isCustomField,
		}));

		const formData = new FormData();

		formData.append("file", file);
		formData.append("columns", JSON.stringify(columnsToMapMapped));

		importMutation.mutate(formData, {
			onSuccess: () => {
				form.reset();

				setStep(step => step + 1);
			},
			onError: () => {
				setStep(step => step + 1);
			},
		});
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
					disabled={
						!functions.import || disabled || pathname !== "/transactions"
					}
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
						<div className="flex h-full flex-col gap-4">
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
							<Separator className="mb-4" />
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
											<StepMap
												isLoading={isLoading}
												setIsLoading={setIsLoading}
											/>
										)}
										{step === 4 && (
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
											<StepMap
												isLoading={isLoading}
												setIsLoading={setIsLoading}
											/>
										)}
										{step === 3 && (
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
											disabled={importMutation.isPending}
										>
											{step === stepsFiltered.length || step === 1
												? "Fechar"
												: "Voltar"}
										</Button>
										{step !== stepsFiltered.length - 1 &&
											step !== stepsFiltered.length && (
												<Button
													type="button"
													onClick={() => {
														setStep(step => step + 1);

														if (step === stepsFiltered.length - 2)
															setIsLoading(true);
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
													Avançar
												</Button>
											)}

										{step === stepsFiltered.length - 1 && (
											<Button
												type="submit"
												disabled={
													importMutation.isPending ||
													importMutation.isSuccess ||
													form.formState.isSubmitting ||
													!fileInput ||
													Object.keys(form.formState.errors).length > 0 ||
													isLoading
												}
												className={cn(
													"w-full max-w-24",
													importMutation.isPending ||
														importMutation.isSuccess ||
														form.formState.isSubmitting
														? "max-w-36"
														: ""
												)}
											>
												{importMutation.isPending ||
												importMutation.isSuccess ||
												form.formState.isSubmitting ? (
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
