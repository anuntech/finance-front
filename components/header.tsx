import type { IFormData } from "@/types/form-data";
import { formatBalance } from "@/utils/format-balance";
import { Plus } from "lucide-react";
import { type JSX, useState } from "react";
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

interface Props {
	title: string;
	totalBalance: number | null;
	dialog: {
		title: string;
		description: string;
	};
	FormData: IFormData;
}

export const Header = ({ title, totalBalance, dialog, FormData }: Props) => {
	const [openDialog, setOpenDialog] = useState(false);

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
				<Dialog
					open={openDialog}
					onOpenChange={isOpen => {
						if (!isOpen) {
							setOpenDialog(false);
						}
					}}
				>
					<DialogTrigger asChild>
						<Button
							className="ml-auto rounded-lg bg-green-500 hover:bg-green-600"
							disabled={totalBalanceFormatted === null}
							onClick={() => setOpenDialog(true)}
						>
							<Plus /> Adicionar
						</Button>
					</DialogTrigger>
					<DialogContent>
						<DialogHeader>
							<DialogTitle>{dialog.title}</DialogTitle>
							<DialogDescription>{dialog.description}</DialogDescription>
						</DialogHeader>
						<FormData type="add" setOpenDialog={setOpenDialog} />
					</DialogContent>
				</Dialog>
			</div>
		</header>
	);
};
