import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
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
import {
	Select,
	SelectContent,
	SelectGroup,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { type Account, getAccounts } from "@/http/accounts/get";
import { createAccount } from "@/http/accounts/post";
import { updateAccount } from "@/http/accounts/put";
import { getBanks } from "@/http/banks/get";
import { cn } from "@/lib/utils";
import { accountsKeys } from "@/queries/keys/accounts";
import { banksKeys } from "@/queries/keys/banks";
import type { IAccountForm } from "@/schemas/account";
import { accountSchema } from "@/schemas/account";
import type { IFormData } from "@/types/form-data";
import { getFavicon } from "@/utils/get-favicon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { NumericFormat } from "react-number-format";

export const AccountForm: IFormData = ({ type, setComponentIsOpen, id }) => {
	const queryClient = useQueryClient();

	const { month, year } = useDateWithMonthAndYear();

	const { data: accounts } = useQuery({
		queryKey: accountsKeys.filter({ month, year }),
		queryFn: () => getAccounts({ month, year }),
	});

	const account = accounts?.find(account => account.id === id);

	const {
		data: banks,
		isLoading: isLoadingBanks,
		isSuccess: isSuccessBanks,
	} = useQuery({
		queryKey: banksKeys.all,
		queryFn: getBanks,
	});

	const form = useForm<IAccountForm>({
		defaultValues: {
			name: type === "edit" ? account?.name : "",
			balance: type === "edit" ? account?.balance : null,
			bankId: type === "edit" ? account?.bankId : "",
		},
		resolver: zodResolver(accountSchema),
	});

	const addAccountMutation = useMutation({
		mutationFn: (data: IAccountForm) =>
			createAccount({
				name: data.name,
				balance: data.balance,
				bankId: data.bankId,
			}),
		onSuccess: (data: Account) => {
			queryClient.setQueryData(
				accountsKeys.filter({ month, year }),
				(accounts: Array<Account>) => {
					const newAccount: Account = {
						id: data.id,
						name: data.name,
						currentBalance: data.balance,
						balance: data.balance,
						bankId: data.bankId,
					};

					const newAccounts =
						accounts?.length > 0 ? [newAccount, ...accounts] : [newAccount];

					return newAccounts;
				}
			);
			queryClient.invalidateQueries({
				queryKey: accountsKeys.filter({ month, year }),
			});

			toast.success("Conta criada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao adicionar conta: ${message}`);
		},
	});

	const updateAccountMutation = useMutation({
		mutationFn: (data: IAccountForm) =>
			updateAccount({
				id: id,
				name: data.name,
				balance: data.balance,
				bankId: data.bankId,
			}),
		onSuccess: (_, data: Account) => {
			queryClient.setQueryData(
				accountsKeys.filter({ month, year }),
				(accounts: Array<Account>) => {
					const newAccount = accounts?.map(account => {
						if (account.id !== id) return account;
						const accountUpdated = {
							name: data.name,
							currentBalance: data.currentBalance,
							balance: data.balance,
							bankId: data.bankId,
						};

						return accountUpdated;
					});

					return newAccount;
				}
			);
			queryClient.invalidateQueries({
				queryKey: accountsKeys.filter({ month, year }),
			});

			toast.success("Conta atualizada com sucesso");
			form.reset();

			setComponentIsOpen(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar conta: ${message}`);
		},
	});

	const onSubmit = (data: IAccountForm) => {
		if (Object.keys(form.formState.errors).length > 0) {
			toast.error("Formulário inválido!");

			return;
		}

		if (type === "add") {
			addAccountMutation.mutate(data);
		}

		if (type === "edit") {
			updateAccountMutation.mutate(data);
		}
	};

	useEffect(() => {
		const hasError = !isSuccessBanks && !isLoadingBanks;

		if (hasError) {
			const timeoutId = setTimeout(() => {
				toast.error("Erro ao carregar bancos");
			}, 0);

			return () => clearTimeout(timeoutId);
		}
	}, [isSuccessBanks, isLoadingBanks]);

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
							<FormItem className="w-full">
								<FormLabel>Nome</FormLabel>
								<FormControl>
									<Input
										placeholder="Nome da conta"
										{...form.register("name")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
					<FormField
						control={form.control}
						name="bankId"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Banco</FormLabel>
								<FormControl>
									<Select
										value={field.value}
										onValueChange={value => {
											field.onChange(value);
										}}
										disabled={isLoadingBanks || !isSuccessBanks}
									>
										<SelectTrigger>
											<SelectValue placeholder="Selecione o banco" />
										</SelectTrigger>
										<SelectContent>
											<SelectGroup>
												{banks?.map(bank => (
													<SelectItem
														key={bank.id}
														value={bank.id}
														className="hover:bg-muted"
													>
														<div className="flex items-center gap-2 ">
															<Avatar className="h-4 w-4">
																<AvatarImage
																	src={getFavicon(bank.image)}
																	alt={bank.name.slice(0, 2)}
																/>
																<AvatarFallback>
																	{bank.name.slice(0, 2)}
																</AvatarFallback>
															</Avatar>
															{bank.name}
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
				<FormField
					control={form.control}
					name="balance"
					render={({ field }) => (
						<FormItem className="w-1/2">
							<FormLabel>Saldo inicial</FormLabel>
							<FormControl>
								<NumericFormat
									prefix="R$ "
									thousandSeparator="."
									decimalSeparator=","
									fixedDecimalScale={true}
									decimalScale={2}
									value={field.value}
									onValueChange={values => {
										const numericValue = values.floatValue ?? 0;

										field.onChange(numericValue);
									}}
									placeholder="Saldo inicial da conta"
									customInput={Input}
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
						onClick={() => setComponentIsOpen(false)}
						className="w-full max-w-24"
						disabled={
							addAccountMutation.isPending ||
							updateAccountMutation.isPending ||
							addAccountMutation.isSuccess ||
							updateAccountMutation.isSuccess
						}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={
							addAccountMutation.isPending ||
							updateAccountMutation.isPending ||
							addAccountMutation.isSuccess ||
							updateAccountMutation.isSuccess ||
							isLoadingBanks ||
							!isSuccessBanks
						}
						className={cn(
							"w-full max-w-24",
							addAccountMutation.isPending || updateAccountMutation.isPending
								? "max-w-32"
								: ""
						)}
					>
						{addAccountMutation.isPending || updateAccountMutation.isPending ? (
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
