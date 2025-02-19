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
import type { IFormData } from "@/types/form-data";
import { Plus } from "lucide-react";
import { usePathname } from "next/navigation";

const ROUTES_NOT_ALLOWED = ["/transactions"];

interface AddDialogProps {
	addDialogIsOpen: boolean;
	setAddDialogIsOpen: (isOpen: boolean) => void;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
}

export const AddDialog = ({
	addDialogIsOpen,
	setAddDialogIsOpen,
	dialog,
	FormData,
}: AddDialogProps) => {
	const pathname = usePathname();

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
				<Button
					className="ml-auto rounded-lg bg-green-500 hover:bg-green-600"
					onClick={() => setAddDialogIsOpen(true)}
					disabled={ROUTES_NOT_ALLOWED.includes(pathname)}
				>
					<Plus /> Adicionar
				</Button>
			</DialogTrigger>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>{dialog.title}</DialogTitle>
					<DialogDescription>{dialog.description}</DialogDescription>
				</DialogHeader>
				<FormData type="add" setOpenDialog={setAddDialogIsOpen} />
			</DialogContent>
		</Dialog>
	);
};
