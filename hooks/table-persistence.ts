export function useTablePersistence(pathname: string, isLoading: boolean) {
	const loadTableSettings = () => {
		if (isLoading) return null;

		const savedSettings = localStorage.getItem(`table-settings-${pathname}`);
		if (!savedSettings) return null;

		try {
			return JSON.parse(savedSettings);
		} catch (error) {
			console.error("Erro ao carregar configurações da tabela:", error);
			return null;
		}
	};

	// biome-ignore lint/suspicious/noExplicitAny: <explanation>
	const saveTableSettings = (settings: any) => {
		if (isLoading) return;
		localStorage.setItem(
			`table-settings-${pathname}`,
			JSON.stringify(settings)
		);
	};

	return { loadTableSettings, saveTableSettings };
}
