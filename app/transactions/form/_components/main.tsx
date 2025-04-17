import { type Choices, EditManyChoice } from "@/components/edit-many-choice";
import { DatePicker } from "@/components/extends-ui/date-picker";
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
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useSearch } from "@/contexts/search";
import { useAssignments } from "@/hooks/assignments";
import { getCategories } from "@/http/categories/get";
import { getTransactionsWithInfiniteScroll } from "@/http/transactions/_utils/get-transactions-with-infinite-scroll";
import { getUser } from "@/http/user/get";
import { categoriesKeys } from "@/queries/keys/categories";
import { transactionsKeys } from "@/queries/keys/transactions";
import { userKeys } from "@/queries/keys/user";
import type { ITransactionsForm } from "@/schemas/transactions";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { useInfiniteQuery, useQuery } from "@tanstack/react-query";
import type { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";
import { getCategoryType } from "../";

interface IMainFormProps {
	type: "edit" | "add";
	editType?: "default" | "many";
	id: string;
	transactionType: TRANSACTION_TYPE;
	choices?: Choices | null;
	setChoices?: Dispatch<SetStateAction<Choices>>;
}

export const MainForm = ({
	type,
	editType,
	id,
	transactionType,
	choices,
	setChoices,
}: IMainFormProps) => {
	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();
	const { search } = useSearch();

	const { data: transactionsWithPagination } =
		type === "edit"
			? useInfiniteQuery({
					queryKey: transactionsKeys.filter({
						month,
						year,
						from,
						to,
						dateConfig,
						dateType,
						search,
					}),
					queryFn: async ({ pageParam }) =>
						getTransactionsWithInfiniteScroll({
							offset: pageParam,
							month,
							year,
							from,
							to,
							dateConfig,
							dateType,
							search,
						}),
					initialPageParam: 0,
					getPreviousPageParam: firstPage => firstPage?.previousPage,
					getNextPageParam: lastPage => lastPage?.nextPage,
				})
			: { data: undefined };

	const transactions = transactionsWithPagination?.pages?.flatMap(
		page => page.data
	);

	const FIRST_ID = 0;
	const [transactionId, transactionCurrentCount] =
		type === "edit"
			? editType === "many"
				? id.split(",")[FIRST_ID].split("-")
				: id.split("-")
			: [];
	const transaction =
		transactions?.find(
			transaction =>
				transaction.id === transactionId &&
				(transactionCurrentCount
					? transaction.repeatSettings?.currentCount ===
						Number(transactionCurrentCount)
					: true)
		) || null;

	const {
		data: categories,
		isLoading: isLoadingCategories,
		isSuccess: isSuccessCategories,
	} = useQuery({
		queryKey: categoriesKeys(
			getCategoryType(type === "edit" ? transaction?.type : transactionType)
		).filter({ month, year, from, to, dateConfig, dateType }),
		queryFn: () =>
			getCategories({
				transaction: getCategoryType(
					type === "edit" ? transaction?.type : transactionType
				),
				month,
				year,
				from,
				to,
				dateConfig,
				dateType,
			}),
	});

	const { isLoading: isLoadingUser, isSuccess: isSuccessUser } =
		type === "add"
			? useQuery({
					queryKey: userKeys.all,
					queryFn: () => getUser(),
				})
			: { isLoading: false, isSuccess: true };

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
								<FormLabel>Descrição</FormLabel>
								{type === "edit" && editType === "many" && (
									<EditManyChoice
										id="name"
										choices={choices}
										setChoices={setChoices}
									/>
								)}
								<FormControl
									choice={choices?.find(item => item.id === "name")?.choice}
								>
									<Input
										placeholder="Descrição da transação"
										{...form.register("name")}
									/>
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
								{type === "edit" && editType === "many" && (
									<EditManyChoice
										id="registrationDate"
										choices={choices}
										setChoices={setChoices}
									/>
								)}
								<FormControl
									choice={
										choices?.find(item => item.id === "registrationDate")
											?.choice
									}
								>
									<DatePicker
										date={field.value}
										setDate={field.onChange}
										format="DD/MM/YYYY"
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
						name="supplier"
						render={() => (
							<FormItem className="w-full">
								<FormLabel>Fornecedor</FormLabel>
								{type === "edit" && editType === "many" && (
									<EditManyChoice
										id="supplier"
										choices={choices}
										setChoices={setChoices}
									/>
								)}
								<FormControl
									choice={choices?.find(item => item.id === "supplier")?.choice}
								>
									<Input
										placeholder="Nome do fornecedor"
										{...form.register("supplier")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="assignedTo"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Atribuído a</FormLabel>
								{type === "edit" && editType === "many" && (
									<EditManyChoice
										id="assignedTo"
										choices={choices}
										setChoices={setChoices}
									/>
								)}
								<FormControl
									choice={
										choices?.find(item => item.id === "assignedTo")?.choice
									}
								>
									<Select
										value={field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
										disabled={
											assignments.length === 0 ||
											isLoadingUser ||
											!isSuccessUser
										}
									>
										<SelectTrigger
											choice={
												choices?.find(item => item.id === "assignedTo")?.choice
											}
										>
											<SelectValue placeholder="Selecione o usuário" />
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
				</div>
				<div className="flex w-full gap-2">
					<FormField
						control={form.control}
						name="categoryId"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Categoria</FormLabel>
								{type === "edit" && editType === "many" && (
									<EditManyChoice
										id="categoryId"
										choices={choices}
										setChoices={setChoices}
									/>
								)}
								<FormControl
									choice={
										choices?.find(item => item.id === "categoryId")?.choice
									}
								>
									<Select
										value={field.value === null ? "" : field.value}
										onValueChange={value => {
											form.setValue("subCategoryId", "");

											field.onChange(value);
										}}
										disabled={
											isLoadingCategories || !isSuccessCategories || !categories
										}
									>
										<SelectTrigger
											choice={
												choices?.find(item => item.id === "categoryId")?.choice
											}
										>
											<SelectValue placeholder="Selecione a categoria" />
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
								{type === "edit" && editType === "many" && (
									<EditManyChoice
										id="subCategoryId"
										choices={choices}
										setChoices={setChoices}
									/>
								)}
								<FormControl
									choice={
										choices?.find(item => item.id === "subCategoryId")?.choice
									}
								>
									<Select
										value={field.value === null ? "" : field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
										disabled={
											isLoadingCategories ||
											!isSuccessCategories ||
											!subCategories
										}
									>
										<SelectTrigger
											choice={
												choices?.find(item => item.id === "subCategoryId")
													?.choice
											}
										>
											<SelectValue placeholder="Selecione a subcategoria" />
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
