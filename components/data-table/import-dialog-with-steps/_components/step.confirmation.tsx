import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";
import { Circle, CircleCheck, CircleX, Squircle } from "lucide-react";
import type { ImportMutation } from "../../import-dialog";

interface StepConfirmationProps {
	importMutation: ImportMutation;
}

export const StepConfirmation = ({ importMutation }: StepConfirmationProps) => {
	if (!importMutation) return null;

	const errors =
		importMutation.error &&
		(Array.isArray(importMutation.error.message)
			? importMutation.error.message
			: [importMutation.error.message]);

	return (
		<div className="flex h-full w-full flex-col items-center justify-between gap-4">
			<div
				className={cn(
					"flex h-full min-w-[75%] max-w-[75%] flex-col items-center justify-between",
					importMutation.isSuccess && "justify-center gap-2"
				)}
			>
				<header className="flex w-full flex-col gap-4">
					<h2 className="mx-5 text-center font-bold text-lg">
						{importMutation.isSuccess && "Importação Concluída"}
						{importMutation.isError && (
							<span>Houve um erro ao importar os dados:</span>
						)}
					</h2>
					{importMutation.isError && (
						<ul className="flex h-full w-full flex-col">
							<ScrollArea className="h-[36dvh] min-h-[36dvh] w-full rounded-lg border py-2 shadow-sm">
								{errors?.map((error, index) => (
									<li
										// biome-ignore lint/suspicious/noArrayIndexKey: <explanation>
										key={index}
										className="flex w-full gap-2 px-2 font-medium text-red-500 text-sm"
									>
										<Squircle className="my-1.5 h-2 min-h-2 w-2 min-w-2 rounded-full bg-red-500" />
										<div className="flex flex-col gap-1">
											<span>Linha: {error.line}</span>
											<span style={{ overflowWrap: "anywhere" }}>
												Mensagem: {error.error}
											</span>
										</div>
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
