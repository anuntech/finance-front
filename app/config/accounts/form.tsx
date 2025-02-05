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
import type { Account } from "@/http/accounts/get";
import type { IAccountForm } from "@/schemas/account";
import { accountSchema } from "@/schemas/account";
import type { IFormData } from "@/types/form-data";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import toast from "react-hot-toast";

export const AccountForm: IFormData = ({ type, setOpenDialog, id }) => {
	const queryClient = useQueryClient();

	const data = queryClient.getQueryData<Array<Account>>(["get-accounts"]);

	const account = data?.find(account => account.id === id);

	const form = useForm<IAccountForm>({
		defaultValues: {
			name: type === "edit" ? account?.name : "",
			balance: type === "edit" ? account?.balance : 0,
		},
		resolver: zodResolver(accountSchema),
	});

	const addAccount = (data: IAccountForm) => {
		const accounts = queryClient.getQueryData<Array<Account>>(["get-accounts"]);

		const newAccount: Account = {
			id: crypto.randomUUID(),
			name: data.name,
			balance: data.balance,
			icon: {
				name: "wallet",
				color: "red",
			},
		};

		const newAccounts = [newAccount, ...accounts];

		queryClient.setQueryData(["get-accounts"], newAccounts);
	};

	const updateAccount = (data: IAccountForm) => {
		const accounts = queryClient.getQueryData<Array<Account>>(["get-accounts"]);

		const newAccount = accounts?.map(account =>
			account.id === id ? data : account
		);

		queryClient.setQueryData(["get-accounts"], newAccount);
	};

	const onSubmit = (data: IAccountForm) => {
		try {
			if (type === "add") {
				addAccount(data);
			}

			if (type === "edit") {
				updateAccount(data);
			}

			toast.success("Conta salva com sucesso");
			form.reset();

			setOpenDialog(false);
		} catch (error) {
			toast.error("Erro ao salvar conta");
		}
	};

	return (
		<Form {...form}>
			<form
				onSubmit={form.handleSubmit(onSubmit)}
				className="flex flex-col gap-4"
			>
				<FormField
					control={form.control}
					name="name"
					render={() => (
						<FormItem>
							<FormLabel>Nome</FormLabel>
							<FormControl>
								<Input placeholder="Nome da conta" {...form.register("name")} />
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name="balance"
					render={() => (
						<FormItem>
							<FormLabel>Saldo inicial</FormLabel>
							<FormControl>
								<Input
									type="number"
									placeholder="Saldo inicial da conta"
									{...form.register("balance", {
										valueAsNumber: true,
									})}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<Button type="submit">Salvar</Button>
			</form>
		</Form>
	);
};
