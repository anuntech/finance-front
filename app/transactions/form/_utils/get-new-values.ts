import type { Choices } from "@/components/edit-many-choice";
import type { ITransactionsForm } from "@/schemas/transactions";

interface GetNewsValuesProps {
	dataWithTagsAndSubTags: ITransactionsForm;
	choices: Choices;
}

export const getNewValues = ({
	dataWithTagsAndSubTags,
	choices,
}: GetNewsValuesProps) => {
	const newValues: Record<string, unknown> = {
		customFields: [],
	};

	for (const choice of choices) {
		switch (choice.id) {
			case "name":
			case "description":
			case "accountId":
			case "supplier":
			case "assignedTo":
			case "categoryId":
			case "subCategoryId":
			case "registrationDate":
			case "dueDate":
			case "confirmationDate":
			case "isConfirmed":
				switch (choice.choice) {
					case "same":
						newValues[choice.id] = null;

						break;
					case "other":
						newValues[choice.id] = dataWithTagsAndSubTags[choice.id];

						break;

					case "clear":
						newValues[choice.id] = "";

						break;
				}
				break;
			case "repeatSettings.count":
			case "repeatSettings.interval":
			case "repeatSettings.customDay": {
				const [key, value] = choice.id.split(".");

				newValues[key] = {
					...((newValues[key] as object) || {}),
					[value]: null,
				};

				break;
			}
			case "frequency": {
				newValues[choice.id] = null;

				break;
			}
			case "balance.value": {
				const [key, value] = choice.id.split(".");

				newValues[key] = {
					...((newValues[key] as object) || {}),
					[value]: null,
				};

				break;
			}
			case "balance.discount.value":
			case "balance.interest.value": {
				const [key, value] = choice.id.split(".");

				const valueToSet =
					// @ts-expect-error
					dataWithTagsAndSubTags.balance[value].type === "value"
						? value
						: `${value}Percentage`;
				const valueToNotSet =
					// @ts-expect-error
					dataWithTagsAndSubTags.balance[value].type === "value"
						? `${value}Percentage`
						: value;

				switch (choice.choice) {
					case "same":
						newValues[key] = {
							...((newValues[key] as object) || {}),
							[valueToSet]: null,
						};

						break;

					case "other":
						newValues[key] = {
							...((newValues[key] as object) || {}),
							// @ts-expect-error
							[valueToSet]: dataWithTagsAndSubTags.balance[value].value,
						};

						break;

					case "clear":
						newValues[key] = {
							...((newValues[key] as object) || {}),
							[valueToSet]: null,
						};

						break;
				}

				newValues[key] = {
					...((newValues[key] as object) || {}),
					[valueToNotSet]: null,
				};

				break;
			}
			case "subTags":
				break;
			case "tags": {
				switch (choice.choice) {
					case "same":
						newValues[choice.id] = null;

						break;

					case "other":
						newValues[choice.id] = dataWithTagsAndSubTags.tagsAndSubTags;

						break;

					case "clear":
						newValues[choice.id] = [];

						break;
				}

				break;
			}
			default:
				if (choice.id.includes("customField")) {
					const [_, id] = choice.id.split(".");

					switch (choice.choice) {
						case "same":
							// @ts-expect-error
							newValues.customFields.push({
								id,
								value: null,
							});

							break;
						case "other":
							// @ts-expect-error
							newValues.customFields.push({
								id,
								value: dataWithTagsAndSubTags.customField[id].fieldValue,
							});

							break;
						case "clear":
							// @ts-expect-error
							newValues.customFields.push({
								id,
								value: choice.clearedValue,
							});

							break;
					}
				}

				break;
		}
	}

	return newValues;
};
