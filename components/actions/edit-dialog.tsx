"use client";

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import type { IFormData } from "@/types/form-data";

interface EditDialogProps {
	editDialogIsOpen: boolean;
	setEditDialogIsOpen: (isOpen: boolean) => void;
	details: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	id?: string;
}

export const EditDialog = ({
	editDialogIsOpen,
	setEditDialogIsOpen,
	details,
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
					<DialogTitle>{details.title}</DialogTitle>
					<DialogDescription>{details.description}</DialogDescription>
				</DialogHeader>
				<FormData
					type="edit"
					setComponentIsOpen={setEditDialogIsOpen}
					id={id}
				/>
			</DialogContent>
		</Dialog>
	);
};
