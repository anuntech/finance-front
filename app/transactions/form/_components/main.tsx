import { DatePicker } from "@/components/date-picker";
import { IconComponent } from "@/components/get-lucide-icon";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useAssignments } from "@/hooks/assignments";
import { getCategories } from "@/http/categories/get";
import { getTransactions } from "@/http/transactions/get";
import type { ITransactionsForm } from "@/schemas/transactions";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { useQuery } from "@tanstack/react-query";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { NumericFormat } from "react-number-format";
import { getCategoryType } from "..";

interface IMainFormProps {
	type: "edit" | "add";
	id: string;
	transactionType: TRANSACTION_TYPE;
}

export const MainForm = ({ type, id, transactionType }: IMainFormProps) => {
	const { data: transactions } = useQuery({
		queryKey: ["get-transactions"],
		queryFn: getTransactions,
	});

	const transaction = transactions?.find(transaction => transaction.id === id);

	const {
		data: categories,
		isLoading: isLoadingCategories,
		isSuccess: isSuccessCategories,
	} = useQuery({
		queryKey: ["get-categories"],
		queryFn: () =>
			getCategories(
				getCategoryType(type === "edit" ? transaction?.type : transactionType)
			),
	});

	if (!isSuccessCategories && !isLoadingCategories) {
		toast.error("Erro ao carregar categorias");
	}

	const workspaceId =
		typeof window !== "undefined" ? localStorage.getItem("workspaceId") : "";

	const { assignments } = useAssignments(workspaceId);

	const form = useFormContext<ITransactionsForm>();
	const categoryIdWatch = form.watch("categoryId");

	const subCategories = categories?.find(
		category => category.id === categoryIdWatch
	)?.subCategories;

	if (!isSuccessCategories && !isLoadingCategories && !subCategories) {
		toast.error("Erro ao carregar subcategorias");
	}

	return (
		<section className="flex flex-col gap-2">
			<header>
				<h2 className="font-semibold text-md">Informações principais</h2>
			</header>
			<div className="flex flex-col gap-4">
				<div className="flex w-full gap-2">
					<FormField
						control={form.control}
						name="name"
						render={() => (
							<FormItem className="w-full">
								<FormLabel>Número do documento</FormLabel>
								<FormControl>
									<Input
										placeholder="Número do documento da transação"
										{...form.register("name")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="invoice"
						render={() => (
							<FormItem className="w-full">
								<FormLabel>Nota fiscal</FormLabel>
								<FormControl>
									<div className="flex w-full items-end gap-2">
										<Input
											placeholder="Número da nota fiscal"
											{...form.register("invoice")}
										/>
									</div>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="registrationDate"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Data de competência</FormLabel>
								<FormControl>
									<DatePicker date={field.value} setDate={field.onChange} />
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="balance.value"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Valor</FormLabel>
								<FormControl>
									<NumericFormat
										prefix="R$ "
										thousandSeparator="."
										decimalSeparator=","
										fixedDecimalScale={true}
										decimalScale={2}
										value={field.value}
										onValueChange={values => {
											const numericValue = values.floatValue ?? null;

											field.onChange(numericValue);
										}}
										allowNegative={false}
										placeholder="Valor da transação"
										customInput={Input}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex w-full gap-2">
					<FormField
						control={form.control}
						name="assignedTo"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Atribuído a</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
										disabled={assignments.length === 0}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione a frequência" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{assignments.map(assigned => (
													<SelectItem key={assigned.id} value={assigned.id}>
														<div className="flex items-center gap-2">
															<Avatar className="h-6 w-6">
																<AvatarImage
																	src={assigned.image}
																	alt={assigned.name}
																/>
																<AvatarFallback>
																	{assigned.name.slice(0, 2)}
																</AvatarFallback>
															</Avatar>
															{assigned.name}
														</div>
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
					<FormField
						control={form.control}
						name="supplier"
						render={() => (
							<FormItem className="w-full">
								<FormLabel>Fornecedor</FormLabel>
								<FormControl>
									<Input
										placeholder="Nome do fornecedor"
										{...form.register("supplier")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				</div>
				<div className="flex w-full gap-2">
					<FormField
						control={form.control}
						name="categoryId"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Categoria</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
										disabled={
											isLoadingCategories || !isSuccessCategories || !categories
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione a conta" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{categories?.map(category => (
													<SelectItem
														key={category.id}
														value={category.id}
														className="hover:bg-muted"
													>
														<div className="flex items-center gap-2 ">
															<IconComponent name={category.icon} />
															{category.name}
														</div>
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
					<FormField
						control={form.control}
						name="subCategoryId"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Subcategoria</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
										disabled={
											isLoadingCategories ||
											!isSuccessCategories ||
											!subCategories
										}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione a conta" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{subCategories?.map(subCategory => (
													<SelectItem
														key={subCategory.id}
														value={subCategory.id}
														className="hover:bg-muted"
													>
														<div className="flex items-center gap-2 ">
															<IconComponent name={subCategory.icon} />
															{subCategory.name}
														</div>
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
			</div>
		</section>
	);
};
