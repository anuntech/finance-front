"use client";
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
import { cn } from "@/lib/utils";
import type { IFormData } from "@/types/form-data";
import type { UseMutationResult } from "@tanstack/react-query";
import { EllipsisVerticalIcon, Loader2, Pencil, Trash2 } from "lucide-react";
import { useState } from "react";

// biome-ignore lint/suspicious/noExplicitAny: <explanation>
type HandleDelete = UseMutationResult<any, Error, string, unknown>;

interface DeleteDialogProps {
	deleteDialogIsOpen: boolean;
	setDeleteDialogIsOpen: (isOpen: boolean) => void;
	handleDelete: HandleDelete;
	id: string;
}

const DeleteDialog = ({
	deleteDialogIsOpen,
	setDeleteDialogIsOpen,
	handleDelete,
	id,
}: DeleteDialogProps) => {
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
						disabled={handleDelete.isPending || handleDelete.isSuccess}
						className="w-full max-w-24"
					>
						Cancelar
					</Button>
					<Button
						variant="destructive"
						disabled={handleDelete.isPending || handleDelete.isSuccess}
						onClick={() =>
							handleDelete.mutate(id, {
								onSuccess: () => {
									handleDelete.reset();

									setDeleteDialogIsOpen(false);
								},
							})
						}
						className={cn(
							"w-full max-w-24",
							handleDelete.isPending || handleDelete.isSuccess ? "max-w-32" : ""
						)}
					>
						{handleDelete.isPending ? (
							<>
								<Loader2 className="h-4 w-4 animate-spin" />
								Excluindo...
							</>
						) : (
							"Excluir"
						)}
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	);
};

interface EditDialogProps {
	editDialogIsOpen: boolean;
	setEditDialogIsOpen: (isOpen: boolean) => void;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	id?: string;
}

const EditDialog = ({
	editDialogIsOpen,
	setEditDialogIsOpen,
	dialog,
	FormData,
	id,
}: EditDialogProps) => {
	return (
		<Dialog
			open={editDialogIsOpen}
			onOpenChange={isOpen => {
				if (!isOpen) {
					setEditDialogIsOpen(false);
				}
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{dialog.title}</DialogTitle>
					<DialogDescription>{dialog.description}</DialogDescription>
				</DialogHeader>
				<FormData type="edit" setOpenDialog={setEditDialogIsOpen} id={id} />
			</DialogContent>
		</Dialog>
	);
};

interface Props {
	handleDelete: HandleDelete;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	id?: string;
}

export const Actions = ({ handleDelete, dialog, FormData, id }: Props) => {
	const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
	const [editDialogIsOpen, setEditDialogIsOpen] = useState(false);

	return (
		<>
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
							className="flex w-full items-center justify-start gap-2"
							onClick={() => setEditDialogIsOpen(true)}
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
				handleDelete={handleDelete}
				id={id}
			/>
			<EditDialog
				editDialogIsOpen={editDialogIsOpen}
				setEditDialogIsOpen={setEditDialogIsOpen}
				dialog={dialog}
				FormData={FormData}
				id={id}
			/>
		</>
	);
};
