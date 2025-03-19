import { DATE_TYPE } from "@/types/enums/date-type";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useState,
} from "react";

interface IDateTypeContext {
	dateType: DATE_TYPE;
	setDateType: Dispatch<SetStateAction<DATE_TYPE>>;
}

export const DateTypeContext = createContext<IDateTypeContext>({
	dateType: DATE_TYPE.CONFIRMATION,
	setDateType: () => {},
});

export const DateTypeProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [dateType, setDateType] = useState<DATE_TYPE>(DATE_TYPE.NULL);

	return (
		<DateTypeContext.Provider value={{ dateType, setDateType }}>
			{children}
		</DateTypeContext.Provider>
	);
};

export const useDateType = () => {
	const { dateType, setDateType } = useContext(DateTypeContext);

	return { dateType, setDateType };
};
