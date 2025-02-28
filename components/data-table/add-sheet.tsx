"use client";

import { Button } from "@/components/ui/button";
import {
	Sheet,
	SheetContent,
	SheetDescription,
	SheetHeader,
	SheetTitle,
	SheetTrigger,
} from "@/components/ui/sheet";
import type { IFormData } from "@/types/form-data";
import { Plus } from "lucide-react";

export interface AddSheetProps {
	addSheetIsOpen: boolean;
	setAddSheetIsOpen: (isOpen: boolean) => void;
	details: {
		title: string;
		description: string;
	};
	FormData: IFormData;
}

// deprecated
export const AddSheet = ({
	addSheetIsOpen,
	setAddSheetIsOpen,
	details,
	FormData,
}: AddSheetProps) => {
	return (
		<Sheet
			open={addSheetIsOpen}
			onOpenChange={addSheetIsOpen => {
				if (!addSheetIsOpen) {
					setAddSheetIsOpen(false);
				}
			}}
		>
			<SheetTrigger asChild>
				<Button
					className="ml-auto rounded-lg bg-green-500 hover:bg-green-600"
					onClick={() => setAddSheetIsOpen(true)}
				>
					<Plus /> Adicionar
				</Button>
			</SheetTrigger>
			<SheetContent className="sm:min-w-[40%] sm:max-w-lg">
				<div className="flex flex-col gap-4">
					<SheetHeader>
						<SheetTitle>{details.title}</SheetTitle>
						<SheetDescription>{details.description}</SheetDescription>
					</SheetHeader>
					<FormData type="add" setComponentIsOpen={setAddSheetIsOpen} />
				</div>
			</SheetContent>
		</Sheet>
	);
};
