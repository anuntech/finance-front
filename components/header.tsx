import type { IFormData } from "@/types/form-data";
import { formatBalance } from "@/utils/format-balance";
import { Plus } from "lucide-react";
import { Button } from "./ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from "./ui/dialog";
import { Skeleton } from "./ui/skeleton";

interface AddDialogProps {
	addDialogIsOpen: boolean;
	setAddDialogIsOpen: (isOpen: boolean) => void;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	totalBalanceFormatted: string | null;
}

const AddDialog = ({
	addDialogIsOpen,
	setAddDialogIsOpen,
	dialog,
	FormData,
	totalBalanceFormatted,
}: AddDialogProps) => {
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
					disabled={totalBalanceFormatted === null}
					onClick={() => setAddDialogIsOpen(true)}
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

interface Props {
	title: string;
	totalBalance: number | null;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
	addDialogIsOpen: boolean;
	setAddDialogIsOpen: (isOpen: boolean) => void;
}

export const Header = ({
	title,
	totalBalance,
	dialog,
	FormData,
	addDialogIsOpen,
	setAddDialogIsOpen,
}: Props) => {
	const totalBalanceFormatted = totalBalance
		? formatBalance(totalBalance)
		: null;

	return (
		<header className="flex justify-between gap-2">
			<div className="flex flex-col gap-2">
				<h1 className="font-bold text-2xl">{title}</h1>
				<span className="text-muted-foreground text-sm">
					{totalBalance ? (
						totalBalanceFormatted
					) : (
						<Skeleton className="h-4 w-20" />
					)}
				</span>
			</div>
			<div>
				<AddDialog
					addDialogIsOpen={addDialogIsOpen}
					setAddDialogIsOpen={setAddDialogIsOpen}
					dialog={dialog}
					FormData={FormData}
					totalBalanceFormatted={totalBalanceFormatted}
				/>
			</div>
		</header>
	);
};
