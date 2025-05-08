import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Circle, CircleCheck, CircleX, Squircle } from "lucide-react";
import type { ImportMutation } from "../../import-dialog";

interface StepConfirmationProps {
	importMutation: ImportMutation;
}

export const StepConfirmation = ({ importMutation }: StepConfirmationProps) => {
	const errors = importMutation.error.message as unknown as Array<string>;

	return (
		<div className="flex h-full w-full flex-col items-center justify-between gap-4">
			<div className="flex h-full w-full max-w-[75%] flex-col items-center justify-between">
				<header className="flex flex-col gap-4">
					<h2 className="mx-5 text-center font-bold text-lg">
						{importMutation.isPending && "Importando dados..."}
						{importMutation.isSuccess && "Importação Concluída"}
						{importMutation.isError && (
							<span>Houve um erro ao importar os dados:</span>
						)}
					</h2>
					{importMutation.isError && (
						<ul className="flex h-full flex-col">
							<ScrollArea className="h-[36dvh] min-h-[36dvh] rounded-lg border py-2 shadow-sm">
								{errors.map(error => (
									<li
										key={error}
										className="flex w-full items-center gap-2 px-2 font-medium text-red-500 text-sm"
									>
										<Squircle className="h-2 min-h-2 w-2 min-w-2 rounded-full bg-red-500" />
										<span style={{ overflowWrap: "anywhere" }}>{error}</span>
									</li>
								))}
							</ScrollArea>
						</ul>
					)}
				</header>
				{importMutation.isSuccess && (
					<CircleCheck className="h-12 w-12 text-green-500" />
				)}
				{importMutation.isError && (
					<CircleX className="h-12 w-12 text-red-500" />
				)}
			</div>
		</div>
	);
};
