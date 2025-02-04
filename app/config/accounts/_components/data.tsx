"use client";

import { DataTable } from "@/components/data-table";
import { SkeletonTable } from "@/components/skeletton-table";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { type Account, getAccounts } from "@/http/accounts/get";
import { formatBalance } from "@/utils/format-balance";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import type { ColumnDef } from "@tanstack/react-table";
import {
	// ArrowUpDown,
	EllipsisVerticalIcon,
	Pencil,
	Trash2,
} from "lucide-react";
import { useState } from "react";

interface DeleteDialogProps {
	deleteDialogIsOpen: boolean;
	setDeleteDialogIsOpen: (isOpen: boolean) => void;
	accountId: string;
}

const DeleteDialog = ({
	deleteDialogIsOpen,
	setDeleteDialogIsOpen,
	accountId,
}: DeleteDialogProps) => {
	const queryClient = useQueryClient();

	const handleDeleteDialog = () => {
		const accounts = queryClient.getQueryData<Array<Account>>(["get-accounts"]);
		const newAccounts = accounts?.filter(account => account.id !== accountId);

		queryClient.setQueryData(["get-accounts"], newAccounts);

		setDeleteDialogIsOpen(false);
	};

	return (
		<Dialog
			open={deleteDialogIsOpen}
			onOpenChange={isOpen => {
				if (!isOpen) {
					setDeleteDialogIsOpen(false);
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Você tem certeza?</DialogTitle>
					<DialogDescription>
						Esta ação não pode ser desfeita. Isso excluirá permanentemente o seu
						dado.
					</DialogDescription>
				</DialogHeader>
				<DialogFooter>
					<Button
						variant="outline"
						onClick={() => setDeleteDialogIsOpen(false)}
					>
						Cancelar
					</Button>
					<Button variant="destructive" onClick={handleDeleteDialog}>
						Excluir
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

export const columns: Array<ColumnDef<Account>> = [
	{
		accessorKey: "name",
		header: ({ column }) => {
			const header = "Nome";

			column.columnDef.header = header;

			return (
				// <Button
				// 	variant="ghost"
				// 	onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
				// 	disabled
				// >
				// 	{header}
				// 	<ArrowUpDown />
				// </Button>
				<>{header}</>
			);
		},
		cell: ({ row }) => <div className="lowercase">{row.getValue("name")}</div>,
	},
	{
		accessorKey: "balance",
		header: "Saldo",
		cell: ({ row }) => {
			return <span>{formatBalance(row.original.balance)}</span>;
		},
	},
	{
		id: "actions",
		enableHiding: false,
		cell: ({ row }) => {
			const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);

			return (
				<div className="flex justify-end">
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<Button variant="ghost" size="icon" aria-label="Opções">
								<EllipsisVerticalIcon />
							</Button>
						</DropdownMenuTrigger>
						<DropdownMenuContent>
							<DropdownMenuLabel>Opções</DropdownMenuLabel>
							<DropdownMenuSeparator />
							<DropdownMenuItem>
								<button
									type="button"
									className="flex w-full items-center justify-start gap-2 "
								>
									<Pencil />
									Editar
								</button>
							</DropdownMenuItem>
							<DropdownMenuItem>
								<button
									type="button"
									className="flex w-full items-center justify-start gap-2 text-red-500"
									onClick={() => setDeleteDialogIsOpen(true)}
								>
									<Trash2 />
									Excluir
								</button>
							</DropdownMenuItem>
						</DropdownMenuContent>
					</DropdownMenu>
					<DeleteDialog
						deleteDialogIsOpen={deleteDialogIsOpen}
						setDeleteDialogIsOpen={setDeleteDialogIsOpen}
						accountId={row.original.id}
					/>
				</div>
			);
		},
	},
];

export const DataComponent = () => {
	const { data: accounts } = useQuery({
		queryKey: ["get-accounts"],
		queryFn: getAccounts,
	});

	return accounts ? (
		<DataTable columns={columns} data={accounts} />
	) : (
		<SkeletonTable />
	);
};
