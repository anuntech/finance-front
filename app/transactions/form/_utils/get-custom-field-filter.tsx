import { SelectItem } from "@/components/ui/select";

import { SelectContent } from "@/components/ui/select";

import { SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select } from "@/components/ui/select";

import { CheckboxWithFilterArrIncludesSome } from "@/components/checkbox-with-filter-arr-includes-some";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import { CommandInput } from "@/components/ui/command";
import type { CustomField } from "@/http/custom-fields/get";
import type { TransactionWithTagsAndSubTags } from "@/http/transactions/get";
import { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import type { Column } from "@tanstack/react-table";
import type { Table } from "@tanstack/react-table";

interface GetCustomFieldInputProps {
	customField: CustomField;
	column: Column<TransactionWithTagsAndSubTags>;
	table?: Table<TransactionWithTagsAndSubTags>;
}

export const getCustomFieldFilter = ({
	customField,
	column,
}: GetCustomFieldInputProps) => {
	switch (customField.type) {
		case CUSTOM_FIELD_TYPE.TEXT:
			return (
				<Command>
					<CommandInput
						placeholder="Pesquisar descrição..."
						onValueChange={value => column.setFilterValue(value)}
					/>
					<CommandList />
				</Command>
			);
		case CUSTOM_FIELD_TYPE.NUMBER:
			break;
		case CUSTOM_FIELD_TYPE.SELECT:
			return (
				<Command>
					<CommandInput placeholder="Pesquisar opção..." />
					<CommandEmpty>Nenhuma opção encontrada</CommandEmpty>
					<CommandList>
						<CommandGroup heading="Opções">
							{customField.options?.map(option => {
								return (
									<CommandItem key={option}>
										<CheckboxWithFilterArrIncludesSome
											value={option}
											column={column}
										/>
										<label
											htmlFor={option}
											className="flex w-full items-center gap-2"
										>
											<span>{option}</span>
										</label>
									</CommandItem>
								);
							})}
						</CommandGroup>
					</CommandList>
				</Command>
			);
		default:
			return <></>;
	}
};
