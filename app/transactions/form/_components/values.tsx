import { type Choices, EditManyChoice } from "@/components/edit-many-choice";
import {
	CustomInput,
	CustomSelect,
	InputRoot,
} from "@/components/extends-ui/custom-input";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { SelectItem } from "@/components/ui/select";
import type { ITransactionsForm } from "@/schemas/transactions";
import type { Dispatch, SetStateAction } from "react";
import { useFormContext } from "react-hook-form";
import { NumericFormat } from "react-number-format";

interface ValuesFormProps {
	type?: "add" | "edit";
	editType?: "default" | "many";
	choices?: Choices;
	setChoices?: Dispatch<SetStateAction<Choices>>;
}

export const ValuesForm = ({
	type,
	editType,
	choices,
	setChoices,
}: ValuesFormProps) => {
	const form = useFormContext<ITransactionsForm>();

	const balanceValueWatch = form.watch("balance.value");
	const balanceDiscountTypeWatch = form.watch("balance.discount.type");
	const balanceInterestTypeWatch = form.watch("balance.interest.type");

	return (
		<div className="flex flex-col gap-2">
			<div className="flex w-full gap-2">
				<FormField
					control={form.control}
					name="balance.value"
					render={({ field }) => (
						<FormItem className="w-full">
							<FormLabel>Valor</FormLabel>
							{type === "edit" && editType === "many" && (
								<EditManyChoice
									id="balance.value"
									choices={choices}
									setChoices={setChoices}
								/>
							)}
							<FormControl
								choice={
									choices?.find(item => item.id === "balance.value")?.choice
								}
							>
								<NumericFormat
									prefix="R$ "
									thousandSeparator="."
									decimalSeparator=","
									fixedDecimalScale={true}
									decimalScale={2}
									value={field.value}
									onValueChange={values => {
										const numericValue = values.floatValue ?? null;

										field.onChange(numericValue);
									}}
									allowNegative={false}
									placeholder="Valor da transação"
									customInput={Input}
								/>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name={"balance.discount.value"}
					render={({ field }) => (
						<FormItem className="w-full">
							<FormLabel>Desconto</FormLabel>
							{type === "edit" && editType === "many" && (
								<EditManyChoice
									id="balance.discount.value"
									choices={choices}
									setChoices={setChoices}
								/>
							)}
							<FormControl
								choice={
									choices?.find(item => item.id === "balance.discount.value")
										?.choice
								}
							>
								<InputRoot>
									<NumericFormat
										key={`discount-${balanceValueWatch === null ? "null" : "has-value"}`}
										prefix={balanceDiscountTypeWatch === "value" ? "R$ " : ""}
										suffix={
											balanceDiscountTypeWatch === "percentage" ? "%" : ""
										}
										thousandSeparator="."
										decimalSeparator=","
										fixedDecimalScale={true}
										decimalScale={2}
										value={balanceValueWatch === null ? null : field.value}
										onValueChange={values => {
											const numericValue = values.floatValue ?? null;

											field.onChange(numericValue);
										}}
										allowNegative={false}
										placeholder="Valor do desconto"
										customInput={CustomInput}
										className="w-[70%]"
										disabled={balanceValueWatch === null}
									/>
									<CustomSelect
										classNames={{
											select: {
												value: balanceDiscountTypeWatch,
												onValueChange: (value: "percentage" | "value") =>
													form.setValue("balance.discount.type", value),
												disabled: balanceValueWatch === null,
											},
											selectTrigger: {
												className: "w-[30%]",
											},
											selectValue: {
												placeholder: "Selecione uma opção",
											},
										}}
									>
										<SelectItem value="value">R$</SelectItem>
										<SelectItem value="percentage">%</SelectItem>
									</CustomSelect>
								</InputRoot>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				<FormField
					control={form.control}
					name={"balance.interest.value"}
					render={({ field }) => (
						<FormItem className="w-full">
							<FormLabel>Juros</FormLabel>
							{type === "edit" && editType === "many" && (
								<EditManyChoice
									id="balance.interest.value"
									choices={choices}
									setChoices={setChoices}
								/>
							)}
							<FormControl
								choice={
									choices?.find(item => item.id === "balance.interest.value")
										?.choice
								}
							>
								<InputRoot>
									<NumericFormat
										key={`interest-${balanceValueWatch === null ? "null" : "has-value"}`}
										prefix={balanceInterestTypeWatch === "value" ? "R$ " : ""}
										suffix={
											balanceInterestTypeWatch === "percentage" ? "%" : ""
										}
										thousandSeparator="."
										decimalSeparator=","
										fixedDecimalScale={true}
										decimalScale={2}
										value={balanceValueWatch === null ? null : field.value}
										onValueChange={values => {
											const numericValue = values.floatValue ?? null;

											field.onChange(numericValue);
										}}
										allowNegative={false}
										placeholder="Valor dos juros"
										customInput={CustomInput}
										className="w-[70%]"
										disabled={balanceValueWatch === null}
									/>
									<CustomSelect
										classNames={{
											select: {
												value: balanceInterestTypeWatch,
												onValueChange: (value: "percentage" | "value") =>
													form.setValue("balance.interest.type", value),
												disabled: balanceValueWatch === null,
											},
											selectTrigger: {
												className: "w-[30%]",
											},
											selectValue: {
												placeholder: "Selecione uma opção",
											},
										}}
									>
										<SelectItem value="value">R$</SelectItem>
										<SelectItem value="percentage">%</SelectItem>
									</CustomSelect>
								</InputRoot>
							</FormControl>
							<FormMessage />
						</FormItem>
					)}
				/>
				{(editType !== "many" ||
					(editType === "many" &&
						choices?.find(item => item.id === "balance.value")?.choice ===
							"other")) && (
					<FormField
						control={form.control}
						name="balance.liquidValue"
						render={({ field }) => (
							<FormItem className="w-full">
								<FormLabel>Valor total</FormLabel>
								<FormControl>
									<NumericFormat
										key={`liquid-${balanceValueWatch === null ? "null" : "has-value"}`}
										prefix="R$ "
										thousandSeparator="."
										decimalSeparator=","
										fixedDecimalScale={true}
										decimalScale={2}
										value={balanceValueWatch === null ? null : field.value}
										onValueChange={values => {
											const numericValue = values.floatValue ?? null;

											field.onChange(numericValue);
										}}
										allowNegative
										placeholder="Valor total"
										customInput={Input}
										readOnly
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
			</div>
		</div>
	);
};
