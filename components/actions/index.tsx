"use client";

import { Button } from "@/components/ui/button";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuLabel,
	DropdownMenuSeparator,
	DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { IFormData } from "@/types/form-data";
import { EllipsisVerticalIcon, Pencil, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DeleteDialog, type HandleDelete } from "./delete-dialog";
import { EditDialog } from "./edit-dialog";

const ROUTES_NOT_ALLOWED = ["/transactions"];

interface Props {
	handleDelete: HandleDelete;
	dialog?: {
		title: string;
		description: string;
	};
	FormData?: IFormData;
	id?: string;
}

export const Actions = ({ handleDelete, dialog, FormData, id }: Props) => {
	const pathname = usePathname();

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
					{dialog && FormData && (
						<DropdownMenuItem>
							<button
								type="button"
								className="flex w-full items-center justify-start gap-2"
								onClick={() => setEditDialogIsOpen(true)}
								disabled={!dialog || ROUTES_NOT_ALLOWED.includes(pathname)}
							>
								<Pencil />
								Editar
							</button>
						</DropdownMenuItem>
					)}
					<DropdownMenuItem>
						<button
							type="button"
							className="flex w-full items-center justify-start gap-2 text-red-500"
							onClick={() => setDeleteDialogIsOpen(true)}
							disabled={ROUTES_NOT_ALLOWED.includes(pathname)}
						>
							<Trash2 />
							Excluir
						</button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			{dialog && FormData && (
				<EditDialog
					editDialogIsOpen={editDialogIsOpen}
					setEditDialogIsOpen={setEditDialogIsOpen}
					dialog={dialog}
					FormData={FormData}
					id={id}
				/>
			)}
			<DeleteDialog
				deleteDialogIsOpen={deleteDialogIsOpen}
				setDeleteDialogIsOpen={setDeleteDialogIsOpen}
				handleDelete={handleDelete}
				id={id}
			/>
		</>
	);
};
