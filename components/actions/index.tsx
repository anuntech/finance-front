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
import { CONFIGS } from "@/configs";
import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { IFormData } from "@/types/form-data";
import { EllipsisVerticalIcon, Pencil, Trash2 } from "lucide-react";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { DeleteDialog, type HandleDelete } from "./delete-dialog";

const ROUTES_NOT_ALLOWED_TO_DELETE = ["/transactions"];
interface Props {
	handleDelete: HandleDelete;
	details?: {
		title: string;
		description: string;
	};
	FormData?: IFormData;
	id?: string;
	transactionType?: TRANSACTION_TYPE;
}

export const Actions = ({
	handleDelete,
	details,
	FormData,
	id,
	transactionType,
}: Props) => {
	const pathname = usePathname();

	const { components } = CONFIGS.CONFIGURATION_ROUTES.find(
		route => route.path === pathname
	);

	if (!components) {
		throw new Error("Components not found!");
	}

	const { EditComponent } = components;

	if (!EditComponent) {
		throw new Error("EditComponent not found!");
	}

	const [deleteDialogIsOpen, setDeleteDialogIsOpen] = useState(false);
	const [editComponentIsOpen, setEditComponentIsOpen] = useState(false);

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
					{details && FormData && (
						<DropdownMenuItem>
							<button
								type="button"
								className="flex w-full items-center justify-start gap-2"
								onClick={() => setEditComponentIsOpen(true)}
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
							disabled={ROUTES_NOT_ALLOWED_TO_DELETE.includes(pathname)}
						>
							<Trash2 />
							Excluir
						</button>
					</DropdownMenuItem>
				</DropdownMenuContent>
			</DropdownMenu>
			{details && FormData && (
				<EditComponent
					editDialogIsOpen={editComponentIsOpen}
					setEditDialogIsOpen={setEditComponentIsOpen}
					details={details}
					FormData={FormData}
					id={id}
					transactionType={transactionType}
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
