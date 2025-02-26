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
import type { IFormData } from "@/types/form-data";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

export interface AddDialogProps {
	addDialogIsOpen: boolean;
	setAddDialogIsOpen: (isOpen: boolean) => void;
	transactionType?: TRANSACTION_TYPE;
	setTransactionType?: (type: TRANSACTION_TYPE) => void;
	details: {
		title: string;
		description: string;
	};
	FormData: IFormData;
}

export const AddDialog = ({
	addDialogIsOpen,
	setAddDialogIsOpen,
	transactionType,
	setTransactionType,
	details,
	FormData,
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
							<Button className="ml-auto rounded-lg bg-green-500 hover:bg-green-600">
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
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{details.title}</DialogTitle>
					<DialogDescription>{details.description}</DialogDescription>
				</DialogHeader>
				<FormData
					type="add"
					setComponentIsOpen={setAddDialogIsOpen}
					transactionType={transactionType}
				/>
			</DialogContent>
		</Dialog>
	);
};
