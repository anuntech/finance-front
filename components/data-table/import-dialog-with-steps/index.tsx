import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { DialogTrigger } from "@/components/ui/dialog";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { CONFIGS } from "@/configs";
import { Import } from "lucide-react";
import { usePathname } from "next/navigation";
import { Fragment, useEffect, useState } from "react";
import { StepIndicator } from "./_components/step-indicator";
import { steps } from "./steps";

interface ImportDialogWithStepsProps {
	importDialogIsOpen: boolean;
	setImportDialogIsOpen: (importDialogIsOpen: boolean) => void;
	disabled?: boolean;
}

export const ImportDialogWithSteps = ({
	importDialogIsOpen,
	setImportDialogIsOpen,
	disabled,
}: ImportDialogWithStepsProps) => {
	const pathname = usePathname();

	const { functions } = CONFIGS.CONFIGURATION_ROUTES.find(
		route => route.path === pathname
	);

	const [currentStep, setCurrentStep] = useState(2);
	const [progress, setProgress] = useState(0);

	useEffect(() => {
		setProgress(currentStep * (100 / steps.length));
	}, [currentStep]);

	return (
		<Dialog
			open={importDialogIsOpen}
			onOpenChange={importDialogIsOpen => {
				if (!importDialogIsOpen) {
					setImportDialogIsOpen(false);
				}
			}}
		>
			<DialogTrigger asChild>
				<Button
					variant="outline"
					className="ml-auto"
					title="Importar"
					onClick={() => setImportDialogIsOpen(true)}
					disabled={!functions.import || disabled}
				>
					<Import />
				</Button>
			</DialogTrigger>
			<DialogContent className="max-w-screen-xl overflow-y-auto">
				<DialogHeader>
					<DialogTitle>Importar</DialogTitle>
					<DialogDescription>
						Importe seus dados de forma fácil e rápida.
					</DialogDescription>
				</DialogHeader>
				<Separator className="mb-4" />
				<div className="flex flex-col gap-4">
					<div className="flex w-full items-center justify-between">
						{steps.map(step => (
							<StepIndicator
								key={step.step}
								title={step.title}
								step={step.step}
								isFilled={step.step <= currentStep}
							/>
						))}
					</div>
					<Progress value={progress} className="h-2" />
				</div>
			</DialogContent>
		</Dialog>
	);
};
