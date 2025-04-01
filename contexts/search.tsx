import {
	type Dispatch,
	type SetStateAction,
	createContext,
	useContext,
	useState,
} from "react";

interface ISearchContext {
	search: string;
	setSearch: Dispatch<SetStateAction<string>>;
}

export const SearchContext = createContext<ISearchContext>({
	search: "",
	setSearch: () => {},
});

export const SearchProvider = ({ children }: { children: React.ReactNode }) => {
	const [search, setSearch] = useState("");

	return (
		<SearchContext.Provider value={{ search, setSearch }}>
			{children}
		</SearchContext.Provider>
	);
};

export const useSearch = () => {
	const { search, setSearch } = useContext(SearchContext);

	return { search, setSearch };
};
