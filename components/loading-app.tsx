import { Loader2 } from "lucide-react";

export const LoadingApp = () => {
	return (
		<div className="flex h-screen w-screen items-center justify-center gap-2">
			<Loader2 className="h-10 w-10 animate-spin" />
			Estamos buscando os seus dados...
		</div>
	);
};
