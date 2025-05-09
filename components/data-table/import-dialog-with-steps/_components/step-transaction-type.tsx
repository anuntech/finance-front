import { cn } from "@/lib/utils";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { useSteps } from "../_contexts/steps";

interface CardTransactionTypeProps {
	children: React.ReactNode;
	className?: string;
}

export const CardTransactionType = ({
	children,
	className,
}: CardTransactionTypeProps) => {
	const { setStep, setTransactionType } = useSteps();

	return (
		<button
			type="button"
			className={cn(
				"flex h-80 w-60 flex-col justify-end rounded-lg border border-border p-4 text-left text-white shadow-md transition-all duration-300 hover:scale-105 hover:shadow-lg focus:scale-105 focus:shadow-lg",
				className
			)}
			onClick={() => {
				setStep(step => step + 1);
				setTransactionType(
					children === "Receitas"
						? TRANSACTION_TYPE.RECIPE
						: TRANSACTION_TYPE.EXPENSE
				);
			}}
		>
			<span className="font-medium text-xl">{children}</span>
		</button>
	);
};

export const StepTransactionType = () => {
	return (
		<div className="flex h-full w-full flex-col items-center justify-between gap-4">
			<header className="my-4">
				<h2 className="text-center font-bold text-2xl">
					O que deseja importar?
				</h2>
			</header>
			<div className="flex h-full w-full items-center justify-around gap-4">
				<CardTransactionType className="bg-green-500 hover:bg-green-500/90 focus:bg-green-500/90">
					Receitas
				</CardTransactionType>
				<CardTransactionType className="bg-red-500 hover:bg-red-500/90 focus:bg-red-500/90">
					Despesas
				</CardTransactionType>
			</div>
		</div>
	);
};
