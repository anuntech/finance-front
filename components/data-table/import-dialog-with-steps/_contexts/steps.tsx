import type { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useState,
} from "react";

interface Header {
	header: string;
	headerName: string;
	accessorKey: string;
}

const StepsContext = createContext<{
	step: number;
	setStep: Dispatch<SetStateAction<number>>;
	transactionType: TRANSACTION_TYPE.RECIPE | TRANSACTION_TYPE.EXPENSE | null;
	setTransactionType: Dispatch<
		SetStateAction<TRANSACTION_TYPE.RECIPE | TRANSACTION_TYPE.EXPENSE | null>
	>;
	headers: Array<Header>;
	setHeaders: Dispatch<SetStateAction<Array<Header>>>;
}>({
	step: 1,
	setStep: () => {},
	transactionType: null,
	setTransactionType: () => {},
	headers: [],
	setHeaders: () => {},
});

export const StepsProvider = ({ children }: { children: React.ReactNode }) => {
	const [step, setStep] = useState(3);
	const [transactionType, setTransactionType] = useState<
		TRANSACTION_TYPE.RECIPE | TRANSACTION_TYPE.EXPENSE | null
	>(null);
	const [headers, setHeaders] = useState<Array<Header>>([]);
	return (
		<StepsContext.Provider
			value={{
				step,
				setStep,
				transactionType,
				setTransactionType,
				headers,
				setHeaders,
			}}
		>
			{children}
		</StepsContext.Provider>
	);
};

export const useSteps = () => {
	const {
		step,
		setStep,
		transactionType,
		setTransactionType,
		headers,
		setHeaders,
	} = useContext(StepsContext);

	return {
		step,
		setStep,
		transactionType,
		setTransactionType,
		headers,
		setHeaders,
	};
};
