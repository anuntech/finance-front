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
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { DialogProps, IFormData, ITransferForm } from "@/types/form-data";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";
import type { Dispatch, SetStateAction } from "react";

export interface AddDialogProps {
	addDialogIsOpen: boolean;
	setAddDialogIsOpen: Dispatch<SetStateAction<boolean>>;
	transactionType?: TRANSACTION_TYPE;
	setTransactionType?: (type: TRANSACTION_TYPE) => void;
	details: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	TransferForm?: ITransferForm;
	dialogProps?: DialogProps;
	disabled?: boolean;
}

export const AddDialog = ({
	addDialogIsOpen,
	setAddDialogIsOpen,
	transactionType,
	setTransactionType,
	details,
	FormData,
	TransferForm,
	dialogProps,
	disabled = false,
}: AddDialogProps) => {
	const pathname = usePathname();

	const isTransaction = pathname === "/transactions";

	const handleOpenTransactionDialog = (type: TRANSACTION_TYPE) => {
		setTransactionType(type);
		setAddDialogIsOpen(true);
	};

	return (
		<Dialog
			open={addDialogIsOpen}
			onOpenChange={addDialogIsOpen => {
				if (!addDialogIsOpen) {
					setAddDialogIsOpen(false);
				}
			}}
		>
			<DialogTrigger asChild>
				{isTransaction ? (
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button
								size="sm"
								className="ml-auto rounded-lg bg-green-500 hover:bg-green-600"
								disabled={disabled}
							>
								<Plus /> Adicionar
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>Transação</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<button
									type="button"
									onClick={() =>
										handleOpenTransactionDialog(TRANSACTION_TYPE.RECIPE)
									}
									className="flex w-full flex-1"
								>
									Receita
								</button>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<button
									type="button"
									onClick={() =>
										handleOpenTransactionDialog(TRANSACTION_TYPE.EXPENSE)
									}
									className="flex w-full flex-1"
								>
									Despesa
								</button>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<button
									type="button"
									onClick={() =>
										handleOpenTransactionDialog(TRANSACTION_TYPE.TRANSFER)
									}
									className="flex w-full flex-1"
								>
									Transferência
								</button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
				) : (
					<Button
						className="ml-auto rounded-lg bg-green-500 hover:bg-green-600"
						onClick={() => setAddDialogIsOpen(true)}
					>
						<Plus /> Adicionar
					</Button>
				)}
			</DialogTrigger>
			<DialogContent
				{...(transactionType !== TRANSACTION_TYPE.TRANSFER &&
					dialogProps?.dialogContent)}
			>
				<DialogHeader>
					<DialogTitle>
						{transactionType === TRANSACTION_TYPE.TRANSFER
							? "Fazer transferência entre contas"
							: details.title}
					</DialogTitle>
					<DialogDescription>
						{transactionType === TRANSACTION_TYPE.TRANSFER
							? "Faça uma transferência entre contas. O valor será debitado da conta de origem e creditado na conta de destino."
							: details.description}
					</DialogDescription>
				</DialogHeader>
				{transactionType !== TRANSACTION_TYPE.TRANSFER && (
					<FormData
						type="add"
						setComponentIsOpen={setAddDialogIsOpen}
						transactionType={transactionType}
					/>
				)}
				{transactionType === TRANSACTION_TYPE.TRANSFER && (
					<TransferForm setComponentIsOpen={setAddDialogIsOpen} />
				)}
			</DialogContent>
		</Dialog>
	);
};
