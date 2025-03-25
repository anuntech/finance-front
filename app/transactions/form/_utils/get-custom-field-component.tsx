import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import { SelectContent } from "@/components/ui/select";
import { SelectTrigger, SelectValue } from "@/components/ui/select";
import { Select } from "@/components/ui/select";
import type { CustomField } from "@/http/custom-fields/get";
import type { ITransactionsForm } from "@/schemas/transactions";
import { CUSTOM_FIELD_TYPE } from "@/types/enums/custom-field-type";
import type { ControllerRenderProps, UseFormReturn } from "react-hook-form";
import { NumericFormat } from "react-number-format";

interface GetCustomFieldInputProps {
	customField: CustomField;
	field: ControllerRenderProps<ITransactionsForm>;
	form: UseFormReturn<ITransactionsForm>;
}

export const getCustomFieldComponent = ({
	customField,
	field,
	form,
}: GetCustomFieldInputProps) => {
	switch (customField.type) {
		case CUSTOM_FIELD_TYPE.TEXT:
			return (
				<Input
					placeholder="Digite uma informação"
					{...form.register(`customField.${customField.id}.fieldValue`)}
				/>
			);
		case CUSTOM_FIELD_TYPE.NUMBER:
			return (
				<NumericFormat
					thousandSeparator="."
					decimalSeparator=","
					fixedDecimalScale={true}
					decimalScale={2}
					value={field.value === null ? null : Number(field.value)}
					onValueChange={values => {
						const numericValue = values.floatValue ?? null;

						field.onChange(
							numericValue === null ? null : numericValue?.toString()
						);
					}}
					allowNegative
					placeholder="Digite o valor"
					customInput={Input}
				/>
			);
		case CUSTOM_FIELD_TYPE.SELECT:
			return (
				<Select
					value={field.value === null ? "" : (field.value as string)}
					onValueChange={value => {
						field.onChange(value);
					}}
				>
					<SelectTrigger>
						<SelectValue placeholder="Selecione uma opção" />
					</SelectTrigger>
					<SelectContent>
						{customField.options?.map(option => (
							<SelectItem key={option} value={option}>
								{option}
							</SelectItem>
						))}
					</SelectContent>
				</Select>
			);
		default:
			return <></>;
	}
};
