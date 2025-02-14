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
import { type Account, getAccounts } from "@/http/accounts/get";
import { updateAccount } from "@/http/accounts/put";
import { getBanks } from "@/http/banks/get";
import { cn } from "@/lib/utils";
import type { IAccountForm } from "@/schemas/account";
import { accountSchema } from "@/schemas/account";
import type { IFormData } from "@/types/form-data";
import { getFavicon } from "@/utils/get-favicon";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { NumericFormat } from "react-number-format";

export const AccountForm: IFormData = ({
	type,
	setOpenDialog,
	id,
	addMutation,
}) => {
	const queryClient = useQueryClient();

	const { data: accounts } = useQuery({
		queryKey: ["get-accounts"],
		queryFn: getAccounts,
	});

	const {
		data: banks,
		isLoading: isLoadingBanks,
		isSuccess: isSuccessBanks,
	} = useQuery({
		queryKey: ["get-banks"],
		queryFn: getBanks,
	});

	if (!isSuccessBanks && !isLoadingBanks) {
		toast.error("Erro ao carregar bancos");
	}

	const account = accounts?.find(account => account.id === id);

	const form = useForm<IAccountForm>({
		defaultValues: {
			name: type === "edit" ? account?.name : "",
			balance: type === "edit" ? account?.balance : null,
			bankId: type === "edit" ? account?.bankId : "",
		},
		resolver: zodResolver(accountSchema),
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
			queryClient.setQueryData(["get-accounts"], (accounts: Array<Account>) => {
				const newAccount = accounts?.map(account => {
					if (account.id !== id) return account;
					const accountUpdated = {
						name: data.name,
						balance: data.balance,
						bankId: data.bankId,
					};

					return accountUpdated;
				});

				return newAccount;
			});
			queryClient.invalidateQueries({ queryKey: ["get-accounts"] });

			toast.success("Conta atualizada com sucesso");
			form.reset();

			setOpenDialog(false);
		},
		onError: ({ message }) => {
			toast.error(`Erro ao atualizar conta: ${message}`);
		},
	});

	const onSubmit = (data: IAccountForm) => {
		if (!form.formState.isValid) {
			toast.error("Preencha todos os campos obrigatórios");

			return;
		}

		if (type === "add") {
			addMutation.mutate(data, {
				onSuccess: () => {
					addMutation.reset();
					form.reset();

					setOpenDialog(false);
				},
			});
		}

		if (type === "edit") {
			updateAccountMutation.mutate(data);
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<div className="flex w-full items-center gap-2">
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
						onClick={() => setOpenDialog(false)}
						className="w-full max-w-24"
						disabled={
							addMutation.isPending ||
							updateAccountMutation.isPending ||
							addMutation.isSuccess ||
							updateAccountMutation.isSuccess
						}
					>
						Cancelar
					</Button>
					<Button
						type="submit"
						disabled={
							!form.formState.isValid ||
							addMutation.isPending ||
							updateAccountMutation.isPending ||
							addMutation.isSuccess ||
							updateAccountMutation.isSuccess ||
							isLoadingBanks ||
							!isSuccessBanks
						}
						className={cn(
							"w-full max-w-24",
							addMutation.isPending || updateAccountMutation.isPending
								? "max-w-32"
								: ""
						)}
					>
						{addMutation.isPending || updateAccountMutation.isPending ? (
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
