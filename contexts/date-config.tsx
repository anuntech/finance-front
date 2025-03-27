import { DATE_CONFIG } from "@/types/enums/date-config";
import { DATE_TYPE } from "@/types/enums/date-type";
import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useState,
} from "react";

interface IDateConfigContext {
	dateConfig: DATE_CONFIG;
	setDateConfig: Dispatch<SetStateAction<DATE_CONFIG>>;
}

export const DateConfigContext = createContext<IDateConfigContext>({
	dateConfig: DATE_CONFIG.SINGLE,
	setDateConfig: () => {},
});

export const DateConfigProvider = ({
	children,
}: { children: React.ReactNode }) => {
	const [dateConfig, setDateConfig] = useState<DATE_CONFIG>(DATE_CONFIG.SINGLE);

	return (
		<DateConfigContext.Provider value={{ dateConfig, setDateConfig }}>
			{children}
		</DateConfigContext.Provider>
	);
};

export const useDateConfig = () => {
	const { dateConfig, setDateConfig } = useContext(DateConfigContext);

	return { dateConfig, setDateConfig };
};
