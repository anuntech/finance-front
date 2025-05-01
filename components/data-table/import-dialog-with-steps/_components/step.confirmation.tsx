import { CircleCheck, CircleX } from "lucide-react";
import type { ImportMutation } from "../../import-dialog";

interface StepConfirmationProps {
	importMutation: ImportMutation;
}

export const StepConfirmation = ({ importMutation }: StepConfirmationProps) => {
	return (
		<div className="flex h-full w-full flex-col items-center justify-between gap-4">
			<div className="flex h-full w-full flex-col items-center justify-center gap-4">
				<header className="my-4">
					<h2 className="text-center font-bold text-xl">
						{importMutation.isPending && "Importando dados..."}
						{importMutation.isSuccess && "Importação Concluída"}
						{importMutation.isError && (
							<>
								<span>Houve um erro ao importar os dados:</span>
								<br />
								<span className="text-red-500 text-xs">
									{importMutation.error?.message.length > 255
										? `${importMutation.error.message.slice(0, 255)}...`
										: importMutation.error?.message}
								</span>
							</>
						)}
					</h2>
				</header>
				{importMutation.isSuccess && (
					<CircleCheck className="h-16 w-16 text-green-500" />
				)}
				{importMutation.isError && (
					<CircleX className="h-16 w-16 text-red-500" />
				)}
			</div>
		</div>
	);
};
