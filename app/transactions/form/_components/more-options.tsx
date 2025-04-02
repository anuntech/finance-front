import { type Choices, EditManyChoice } from "@/components/edit-many-choice";
import MultipleSelector from "@/components/extends-ui/multiple-selector";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { useDateConfig } from "@/contexts/date-config";
import { useDateType } from "@/contexts/date-type";
import { useDateWithFromAndTo } from "@/contexts/date-with-from-and-to";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { useSearch } from "@/contexts/search";
import { getCategories } from "@/http/categories/get";
import { type CustomField, getCustomFields } from "@/http/custom-fields/get";
import { getTransactions } from "@/http/transactions/get";
import { cn } from "@/lib/utils";
import { categoriesKeys } from "@/queries/keys/categories";
import { customFieldsKeys } from "@/queries/keys/custom-fields";
import { transactionsKeys } from "@/queries/keys/transactions";
import type { ITransactionsForm } from "@/schemas/transactions";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { type Dispatch, type SetStateAction, useEffect, useState } from "react";
import { useFormContext } from "react-hook-form";
import { getCustomFieldComponent } from "../_utils/get-custom-field-component";

interface MoreOptionsFormProps {
	type?: "edit" | "add";
	editType?: "default" | "many";
	id: string;
	transactionType: TRANSACTION_TYPE;
	choices?: Choices;
	setChoices?: Dispatch<SetStateAction<Choices>>;
}

interface CustomFieldWithIsOpen extends CustomField {
	isOpen: boolean;
}

export const MoreOptionsForm = ({
	id,
	transactionType,
	type,
	editType,
	choices,
	setChoices,
}: MoreOptionsFormProps) => {
	const [descriptionIsOpen, setDescriptionIsOpen] = useState(false);
	const [tagIsOpen, setTagIsOpen] = useState(false);
	const [customFieldsWithIsOpen, setCustomFieldsWithIsOpen] =
		useState<Array<CustomFieldWithIsOpen> | null>(null);

	const { month, year } = useDateWithMonthAndYear();
	const { from, to } = useDateWithFromAndTo();
	const { dateConfig } = useDateConfig();
	const { dateType } = useDateType();
	const { search } = useSearch();

	const { data: transactions } = useQuery({
		queryKey: transactionsKeys.filter({
			month,
			year,
			from,
			to,
			dateConfig,
			dateType,
			search,
		}),
		queryFn: () =>
			getTransactions({ month, year, from, to, dateConfig, dateType, search }),
	});

	const FIRST_ID = 0;

	const transaction =
		transactions?.find(
			transaction =>
				transaction.id ===
				(type === "edit" && editType === "many" ? id.split(",")[FIRST_ID] : id)
		) || null;

	const {
		data: tags,
		isLoading: isLoadingTags,
		isSuccess: isSuccessTags,
	} = useQuery({
		queryKey: categoriesKeys(CATEGORY_TYPE.TAG).filter({
			month,
			year,
			from,
			to,
			dateConfig,
			dateType,
		}),
		queryFn: () =>
			getCategories({
				transaction: CATEGORY_TYPE.TAG,
				month,
				year,
				from,
				to,
				dateConfig,
				dateType,
			}),
	});

	const {
		data: customFields,
		isLoading: isLoadingCustomFields,
		isSuccess: isSuccessCustomFields,
	} = useQuery({
		queryKey: customFieldsKeys.all,
		queryFn: () => getCustomFields(),
		select: data => {
			if (data === null || data?.length === 0) return null;

			return data.filter(customField => {
				if (customField.transactionType === TRANSACTION_TYPE.ALL) return true;

				return customField.transactionType === transactionType;
			});
		},
	});

	const form = useFormContext<ITransactionsForm>();

	const tagsWatch = form.watch("tags");

	const subTags =
		tagsWatch?.map(tag => {
			const subTagsFiltered = tags.find(
				subTag => subTag.id === tag.value
			)?.subCategories;

			if (subTagsFiltered?.length === 0) {
				return {
					tagId: tag.value,
					subTags: [],
				};
			}

			return {
				tagId: tag.value,
				subTags: subTagsFiltered,
			};
		}) || [];

	useEffect(() => {
		if (isLoadingCustomFields) return;

		if (!isSuccessCustomFields && !isLoadingCustomFields) {
			setCustomFieldsWithIsOpen([]);

			return;
		}

		setCustomFieldsWithIsOpen(
			customFields?.map(customField => {
				const customFieldById = form.getValues(`customField.${customField.id}`);

				if (!customFieldById)
					form.setValue(`customField.${customField.id}`, {
						fieldValue: null,
						required: customField.required,
					});

				return {
					id: customField.id,
					name: customField.name,
					type: customField.type,
					required: customField.required,
					options: customField.options,
					transactionType: customField.transactionType,
					isOpen: customField.required || !!customFieldById?.fieldValue,
				};
			}) || []
		);
	}, [
		customFields,
		isLoadingCustomFields,
		isSuccessCustomFields,
		form.setValue,
		form.getValues,
	]);

	useEffect(() => {
		if (transaction?.tags.length > 0) setTagIsOpen(true);

		if (transaction?.description) setDescriptionIsOpen(true);
	}, [transaction]);

	const customFieldsOnlyIsOpen = customFieldsWithIsOpen?.filter(
		customField => customField.isOpen
	);

	return (
		<div className="flex flex-col gap-2">
			<div className="flex w-full flex-wrap gap-2 text-muted-foreground [&>button>span]:font-bold [&>button]:border-2 [&>button]:border-dotted">
				{!descriptionIsOpen && (
					<Button
						type="button"
						variant="outline"
						onClick={() => setDescriptionIsOpen(true)}
						className="w-full max-w-36"
					>
						<Plus />
						<span className="overflow-hidden text-ellipsis">Observação</span>
					</Button>
				)}
				{!tagIsOpen && (
					<Button
						variant="outline"
						onClick={() => setTagIsOpen(true)}
						disabled={isLoadingTags || !isSuccessTags || tags?.length === 0}
						className="w-full max-w-36"
					>
						<Plus />
						<span className="overflow-hidden text-ellipsis">Etiquetas</span>
					</Button>
				)}
				{customFieldsWithIsOpen?.length > 0 &&
					customFieldsWithIsOpen.map(customField => (
						<Button
							key={customField.id}
							type="button"
							variant="outline"
							onClick={() => {
								const customFieldById = form.getValues(
									`customField.${customField.id}`
								);

								if (!customFieldById)
									form.setValue(`customField.${customField.id}`, {
										fieldValue: null,
										required: customField.required,
									});

								setCustomFieldsWithIsOpen(prevCustomFieldsWithIsOpen =>
									prevCustomFieldsWithIsOpen?.map(field => {
										if (field.id === customField.id) {
											return {
												...field,
												isOpen: true,
											};
										}

										return field;
									})
								);
							}}
							disabled={
								isLoadingCustomFields ||
								!isSuccessCustomFields ||
								customFields?.length === 0
							}
							className={cn("w-full max-w-36", customField.isOpen && "hidden")}
						>
							<Plus />
							<span className="overflow-hidden text-ellipsis">
								{customField.name}
							</span>
						</Button>
					))}
				{customFieldsWithIsOpen === null && <Skeleton className="h-10 w-32" />}
			</div>
			<div className="flex flex-col gap-4">
				{descriptionIsOpen && (
					<FormField
						control={form.control}
						name="description"
						render={() => (
							<FormItem className="w-full">
								<FormLabel>Observação</FormLabel>
								{type === "edit" && editType === "many" && (
									<EditManyChoice
										id="description"
										choices={choices}
										setChoices={setChoices}
									/>
								)}
								<FormControl
									choice={
										choices?.find(item => item.id === "description")?.choice
									}
								>
									<Textarea
										className="h-10 max-h-28 min-h-10"
										placeholder="Observação da transação"
										{...form.register("description")}
									/>
								</FormControl>
								<FormMessage />
							</FormItem>
						)}
					/>
				)}
				{tagIsOpen && (
					<div className="flex w-full gap-2">
						<FormField
							control={form.control}
							name="tags"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>Etiqueta</FormLabel>
									{type === "edit" && editType === "many" && (
										<EditManyChoice
											id="tags"
											choices={choices}
											setChoices={setChoices}
										/>
									)}
									<FormControl
										choice={choices?.find(item => item.id === "tags")?.choice}
									>
										<MultipleSelector
											placeholder="Selecione uma etiqueta"
											value={field.value?.map(tag => ({
												value: tag.value,
												label: tag.label,
												icon: tag.icon,
											}))}
											options={
												tags?.map(tag => ({
													value: tag.id,
													label: tag.name,
													icon: tag.icon,
												})) || []
											}
											onChange={value => {
												const tagsSelected = value.map(tag => ({
													value: tag.value,
													label: tag.label,
													icon: tag.icon,
												}));

												field.onChange(tagsSelected);

												// remove sub tags when tag is removed
												const subTagsPrevious = form.getValues("subTags");
												const subTagsRemoved = subTagsPrevious.filter(
													subTag => {
														return !tagsSelected.some(
															tag => tag.value === subTag.tagId
														);
													}
												);

												if (subTagsRemoved.length === 0) return;

												const newSubTags = subTagsPrevious.filter(subTag => {
													return !subTagsRemoved.some(
														subTagRemoved =>
															subTagRemoved.tagId === subTag.tagId
													);
												});

												form.setValue("subTags", newSubTags);
											}}
											disabled={
												isLoadingTags ||
												!isSuccessTags ||
												tags?.length === 0 ||
												field.value === null
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
						<FormField
							control={form.control}
							name="subTags"
							render={({ field }) => (
								<FormItem className="w-full">
									<FormLabel>Sub etiquetas</FormLabel>
									{type === "edit" && editType === "many" && (
										<EditManyChoice
											id="subTags"
											choices={choices}
											setChoices={setChoices}
										/>
									)}
									<FormControl
										choice={
											choices?.find(item => item.id === "subTags")?.choice
										}
									>
										<MultipleSelector
											placeholder="Selecione uma sub etiqueta"
											value={field.value?.map(subTag => ({
												tagId: subTag.tagId,
												value: subTag.value,
												label: subTag.label,
												icon: subTag.icon,
											}))}
											options={subTags?.flatMap(tag => {
												const subTags = tag.subTags?.map(subTag => ({
													tagId: tag.tagId,
													value: subTag.id,
													label: subTag.name,
													icon: subTag.icon,
												}));

												return subTags;
											})}
											onChange={value => {
												field.onChange(value);
											}}
											disabled={
												isLoadingTags ||
												!isSuccessTags ||
												tags?.length === 0 ||
												subTags?.length === 0 ||
												field.value === null
											}
										/>
									</FormControl>
									<FormMessage />
								</FormItem>
							)}
						/>
					</div>
				)}
				<div className="flex flex-col gap-2">
					{customFieldsOnlyIsOpen?.map(customField => (
						<FormField
							key={customField.id}
							control={form.control}
							name={`customField.${customField.id}.fieldValue`}
							render={({ field }) => {
								const customFieldComponent = getCustomFieldComponent({
									customField,
									field,
									form,
									choices,
								});

								return (
									<FormItem className="w-full">
										<FormLabel>{customField.name}</FormLabel>
										{type === "edit" && editType === "many" && (
											<EditManyChoice
												id={`customField.${customField.id}.fieldValue`}
												choices={choices}
												setChoices={setChoices}
											/>
										)}
										<FormControl
											choice={
												choices?.find(
													item =>
														item.id ===
														`customField.${customField.id}.fieldValue`
												)?.choice
											}
										>
											{customFieldComponent}
										</FormControl>
										<FormMessage />
									</FormItem>
								);
							}}
						/>
					))}
				</div>
			</div>
		</div>
	);
};
