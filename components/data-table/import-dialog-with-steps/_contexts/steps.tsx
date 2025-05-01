import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useState,
} from "react";

const StepsContext = createContext<{
	step: number;
	setStep: Dispatch<SetStateAction<number>>;
	transactionType: TRANSACTION_TYPE.RECIPE | TRANSACTION_TYPE.EXPENSE | null;
	setTransactionType: Dispatch<
		SetStateAction<TRANSACTION_TYPE.RECIPE | TRANSACTION_TYPE.EXPENSE | null>
	>;
}>({
	step: 1,
	setStep: () => {},
	transactionType: null,
	setTransactionType: () => {},
});

export const StepsProvider = ({ children }: { children: React.ReactNode }) => {
	const [step, setStep] = useState(1);
	const [transactionType, setTransactionType] = useState<
		TRANSACTION_TYPE.RECIPE | TRANSACTION_TYPE.EXPENSE | null
	>(null);

	return (
		<StepsContext.Provider
			value={{ step, setStep, transactionType, setTransactionType }}
		>
			{children}
		</StepsContext.Provider>
	);
};

export const useSteps = () => {
	const { step, setStep, transactionType, setTransactionType } =
		useContext(StepsContext);

	return { step, setStep, transactionType, setTransactionType };
};
