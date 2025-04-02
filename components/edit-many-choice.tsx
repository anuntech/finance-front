import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";

export type Choices = Array<{
	id: string;
	sameValue: unknown;
	otherValue: unknown;
	clearedValue: unknown;
	choice: "same" | "other" | "clear";
}>;

interface EditManyChoiceProps {
	id: string;
	choices: Choices | null;
	setChoices: Dispatch<SetStateAction<Choices>>;
}

export const EditManyChoice = ({
	id,
	setChoices,
	choices,
}: EditManyChoiceProps) => {
	const form = useFormContext();

	return (
		<Select
			defaultValue="same"
			value={choices?.find(item => item.id === id)?.choice}
			onValueChange={(value: "same" | "other" | "clear") => {
				const otherValue = form.getValues(id);

				form.clearErrors(id);

				switch (value) {
					case "clear":
						form.setValue(
							id,
							choices.find(item => item.id === id)?.clearedValue
						);

						break;
					case "other":
						form.setValue(id, choices.find(item => item.id === id)?.otherValue);

						break;
					case "same":
						form.setValue(id, choices.find(item => item.id === id)?.sameValue);

						break;
					default:
						throw new Error("Invalid choice");
				}

				setChoices(prev =>
					prev.map(item =>
						item.id === id
							? {
									...item,
									choice: value,
									otherValue:
										item.choice === "other" ? otherValue : item.otherValue,
								}
							: item
					)
				);
			}}
		>
			<SelectTrigger className={cn(choices === null && "hidden")}>
				<SelectValue placeholder="Selecione uma opção" />
			</SelectTrigger>
			<SelectContent>
				<SelectItem value="same">Pertence ao mesmo</SelectItem>
				<SelectItem value="other">Mudou para</SelectItem>
				<SelectItem value="clear">Limpar</SelectItem>
			</SelectContent>
		</Select>
	);
};
