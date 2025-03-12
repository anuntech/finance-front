import MultipleSelector from "@/components/extends-ui/multiple-selector";
import { Button } from "@/components/ui/button";
import {
	FormControl,
	FormField,
	FormItem,
	FormLabel,
	FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useDateWithMonthAndYear } from "@/contexts/date-with-month-and-year";
import { getCategories } from "@/http/categories/get";
import type { ITransactionsForm } from "@/schemas/transactions";
import { CATEGORY_TYPE } from "@/types/enums/category-type";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { useState } from "react";
import { useFormContext } from "react-hook-form";
import toast from "react-hot-toast";

export const MoreOptionsForm = () => {
	const [descriptionIsOpen, setDescriptionIsOpen] = useState(false);
	const [tagIsOpen, setTagIsOpen] = useState(false);

	const { date } = useDateWithMonthAndYear();

	const { month, year } = date;

	const {
		data: tags,
		isLoading: isLoadingTags,
		isSuccess: isSuccessTags,
	} = useQuery({
		queryKey: ["get-tags"],
		queryFn: () =>
			getCategories({ transaction: CATEGORY_TYPE.TAG, month, year }),
	});

	if (!isSuccessTags && !isLoadingTags && !tags) {
		toast.error("Erro ao carregar etiquetas");
	}

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

	if (!isSuccessTags && !isLoadingTags && !subTags) {
		toast.error("Erro ao carregar sub etiquetas");
	}

	return (
		<div className="flex flex-col gap-2">
			<div className="flex w-full gap-2 text-muted-foreground [&>button>span]:font-bold [&>button]:border-2 [&>button]:border-dotted">
				{!descriptionIsOpen && (
					<Button variant="outline" onClick={() => setDescriptionIsOpen(true)}>
						<Plus />
						<span>Descrição</span>
					</Button>
				)}
				{!tagIsOpen && (
					<Button variant="outline" onClick={() => setTagIsOpen(true)}>
						<Plus />
						<span>Etiquetas</span>
					</Button>
				)}
			</div>
			<div className="flex flex-col gap-4">
				{descriptionIsOpen && (
					<FormField
						control={form.control}
						name="description"
						render={() => (
							<FormItem className="w-full">
								<FormLabel>Observação</FormLabel>
								<FormControl>
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
									<FormControl>
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
									<FormControl>
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
			</div>
		</div>
	);
};
