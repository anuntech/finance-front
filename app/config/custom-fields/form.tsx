import { Button } from "@/components/ui/button";
import {
	Form,
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useDateType } from "@/contexts/date-type";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { type CustomField, getCustomFields } from "@/http/custom-fields/get";
import { createCustomField } from "@/http/custom-fields/post";
import { updateCustomField } from "@/http/custom-fields/put";
import { cn } from "@/lib/utils";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import { transactionsKeys } from "@/queries/keys/transactions";
import {
	type ICustomFieldForm,
	customFieldsSchema,
} from "@/schemas/custom-fields";
import { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { IFormData } from "@/types/form-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2, Plus, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export const CustomFieldForm: IFormData = ({
	type,
	setComponentIsOpen,
	id,
}) => {
	const { month, year } = useDateWithMonthAndYear();
	const { dateType } = useDateType();

	const queryClient = useQueryClient();

	const { data: customFields } = useQuery({
		queryKey: customFieldsKeys.all,
		queryFn: () => getCustomFields(),
	});

	const customField = customFields?.find(customField => customField.id === id);

	const form = useForm<ICustomFieldForm>({
		defaultValues: {
			name: type === "edit" ? customField?.name : "",
			type: type === "edit" ? customField?.type : CUSTOM_FIELD_TYPE.TEXT,
			options: type === "edit" ? customField?.options : [],
			required: type === "edit" ? customField?.required : false,
			transactionType:
				type === "edit" ? customField?.transactionType : TRANSACTION_TYPE.ALL,
		},
		resolver: zodResolver(customFieldsSchema),
	});

	const addCustomFieldMutation = useMutation({
		mutationFn: (data: ICustomFieldForm) =>
			createCustomField({
				name: data.name,
				type: data.type,
				required: data.required,
				options: data.options,
				transactionType: data.transactionType,
			}),
		onSuccess: (data: CustomField) => {
			queryClient.setQueryData(
				customFieldsKeys.all,
				(customFields: Array<CustomField>) => {
					const newCustomField: CustomField = {
						id: data.id,
						name: data.name,
						type: data.type,
						required: data.required,
						options: data.options,
						transactionType: data.transactionType,
					};

					const newCustomFields =
						customFields?.length > 0
							? [newCustomField, ...customFields]
							: [newCustomField];

					return newCustomFields;
				}
			);
			queryClient.invalidateQueries({ queryKey: customFieldsKeys.all });

			toast.success("Campo criado com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar campo: ${message}`);
		},
	});

	const updateCustomFieldMutation = useMutation({
		mutationFn: (data: ICustomFieldForm) =>
			updateCustomField({
				id: id,
				name: data.name,
				type: data.type,
				required: data.required,
				options: data.options,
				transactionType: data.transactionType,
			}),
		onSuccess: (_, data: CustomField) => {
			queryClient.setQueryData(
				customFieldsKeys.all,
				(customFields: Array<CustomField>) => {
					const newCustomField = customFields?.map(customField => {
						if (customField.id !== id) return customField;
						const customFieldUpdated = {
							name: data.name,
							type: data.type,
							required: data.required,
							options: data.options,
							transactionType: data.transactionType,
						};

						return customFieldUpdated;
					});

					return newCustomField;
				}
			);
			queryClient.invalidateQueries({ queryKey: customFieldsKeys.all });
			queryClient.invalidateQueries({
				queryKey: transactionsKeys.all,
			});
			queryClient.invalidateQueries({
				queryKey: transactionsKeys.filter({
					month: month,
					year: year,
					dateType: dateType,
				}),
			});

			toast.success("Campo atualizado com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar campo: ${message}`);
		},
	});

	const onSubmit = (data: ICustomFieldForm) => {
		if (Object.keys(form.formState.errors).length > 0) {
			toast.error("Formulário inválido!");

			return;
		}
		if (type === "add") {
			addCustomFieldMutation.mutate(data);
		}

		if (type === "edit") {
			updateCustomFieldMutation.mutate(data);
		}
	};

	const typeWatch = form.watch("type");
	const optionsWatch = form.watch("options");

	const handleAddOption = () => {
		form.setValue("options", [...optionsWatch, ""]);
	};

	const handleDeleteOption = (index: number) => {
		form.setValue(
			"options",
			optionsWatch.filter((_, i) => i !== index)
		);
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<div className="flex w-full gap-2">
					<FormField
						control={form.control}
						name="name"
						render={() => (
							<FormItem className="w-3/4">
								<FormLabel>Nome</FormLabel>
								<FormControl>
									<Input
										placeholder="Nome do campo"
										{...form.register("name")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="required"
						render={({ field }) => (
							<FormItem className="flex w-2/4 flex-col gap-2">
								<FormControl>
									<div className="flex h-[72px] w-full items-end justify-between">
										<div className="flex h-10 w-full items-center justify-end gap-4">
											<Switch
												checked={field.value}
												onCheckedChange={currentFieldValue => {
													field.onChange(currentFieldValue);
												}}
											/>
											<span className="text-muted-foreground text-sm">
												Obrigatório
											</span>
										</div>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex w-full gap-2 px-1">
					{typeWatch === CUSTOM_FIELD_TYPE.SELECT && (
						<FormField
							control={form.control}
							name="options"
							render={() => (
								<FormItem className="w-full">
									<FormLabel className="flex items-center justify-between gap-2 px-1">
										Opções
										<Button
											type="button"
											variant="outline"
											onClick={handleAddOption}
											className="h-10 w-10"
											title="Adicionar opção"
										>
											<Plus className="h-4 w-4" />
										</Button>
									</FormLabel>
									<FormControl>
										<ScrollArea
											className={cn(
												"",
												optionsWatch.length <= 5
													? `h-[${optionsWatch.length * 16}px]`
													: "h-[25dvh]"
											)}
										>
											<div className="flex flex-col gap-2 px-1 py-1">
												{optionsWatch.map((_, index) => (
													<FormField
														// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
														key={index}
														control={form.control}
														name={`options.${index}`}
														render={() => (
															<FormItem>
																<FormControl>
																	<div className="flex items-center gap-2">
																		<Input
																			placeholder="Nome da opção"
																			{...form.register(`options.${index}`)}
																		/>
																		<Button
																			type="button"
																			variant="outline"
																			onClick={() => handleDeleteOption(index)}
																			className="h-10 w-10"
																			title="Deletar opção"
																			disabled={optionsWatch.length === 1}
																		>
																			<Trash className="h-4 w-4" />
																		</Button>
																	</div>
																</FormControl>
																<FormMessage />
															</FormItem>
														)}
													/>
												))}
											</div>
										</ScrollArea>
									</FormControl>
								</FormItem>
							)}
						/>
					)}
					<FormField
						control={form.control}
						name="type"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Tipo</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={value => {
											if (value === CUSTOM_FIELD_TYPE.SELECT) {
												form.setValue("options", [""]);
											}

											if (
												value !== CUSTOM_FIELD_TYPE.SELECT &&
												optionsWatch.length > 0
											) {
												form.setValue("options", []);
											}

											field.onChange(value);
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione o tipo do campo" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{Object.values(CUSTOM_FIELD_TYPE).map(type => (
													<SelectItem
														key={type}
														value={type}
														className="hover:bg-muted"
													>
														{type === CUSTOM_FIELD_TYPE.TEXT && (
															<span>Texto</span>
														)}
														{type === CUSTOM_FIELD_TYPE.NUMBER && (
															<span>Número</span>
														)}
														{/* {type === CUSTOM_FIELD_TYPE.DATE && (
															<span>Data</span>
														)} */}
														{type === CUSTOM_FIELD_TYPE.SELECT && (
															<span>Seleção</span>
														)}
													</SelectItem>
												))}
											</SelectGroup>
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex w-full flex-col gap-2 px-1">
					<FormField
						control={form.control}
						name="transactionType"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Tipo de Transação</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione o tipo de transação" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{Object.values(TRANSACTION_TYPE).map(
													transactionType => (
														<SelectItem
															key={transactionType}
															value={transactionType}
															className="hover:bg-muted"
														>
															{transactionType === TRANSACTION_TYPE.ALL && (
																<span>Todas</span>
															)}
															{transactionType === TRANSACTION_TYPE.EXPENSE && (
																<span>Despesa</span>
															)}
															{transactionType === TRANSACTION_TYPE.RECIPE && (
																<span>Receita</span>
															)}
														</SelectItem>
													)
												)}
											</SelectGroup>
										</SelectContent>
									</Select>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex w-full items-center justify-end gap-2 px-1">
					<Button
						variant="outline"
						type="button"
						onClick={() => setComponentIsOpen(false)}
						className="w-full max-w-24"
						disabled={
							addCustomFieldMutation.isPending ||
							updateCustomFieldMutation.isPending ||
							addCustomFieldMutation.isSuccess ||
							updateCustomFieldMutation.isSuccess
						}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={
							addCustomFieldMutation.isPending ||
							updateCustomFieldMutation.isPending ||
							addCustomFieldMutation.isSuccess ||
							updateCustomFieldMutation.isSuccess
						}
						className={cn(
							"w-full max-w-24",
							addCustomFieldMutation.isPending ||
								updateCustomFieldMutation.isPending
								? "max-w-32"
								: ""
						)}
					>
						{addCustomFieldMutation.isPending ||
						updateCustomFieldMutation.isPending ? (
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
	);
};
