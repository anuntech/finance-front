import { FREQUENCY } from "@/types/enums/frequency";
import { INTERVAL } from "@/types/enums/interval";
import { TRANSACTION_TYPE } from "@/types/enums/transaction-type";
import { z } from "zod";

export const transactionsSchema = z
	.object({
		type: z.nativeEnum(TRANSACTION_TYPE),
		name: z
			.string()
			.min(3, {
				message: "Descrição deve ter no mínimo 3 caracteres",
			})
			.max(30, {
				message: "Descrição deve ter no máximo 30 caracteres",
			})
			.regex(/^[\p{L}\p{N}\p{P}\p{S}\s]+$/u, {
				message: "Número do documento inválido",
			}),
		description: z
			.string()
			.max(255, {
				message: "Observação deve ter no máximo 255 caracteres",
			})
			.optional(),
		assignedTo: z
			.string()
			.min(1, { message: "Atribuído a é obrigatório" })
			.nullable(),
		supplier: z
			.string()
			.max(30, { message: "Fornecedor deve ter no máximo 30 caracteres" })
			.nullish()
			.refine(
				data => {
					if (data.length > 0 && data.length < 3) {
						return false;
					}

					return true;
				},
				{
					message: "Fornecedor deve ter no mínimo 3 caracteres",
				}
			),
		balance: z.object({
			value: z
				.number({ message: "Valor é obrigatório" })
				.min(0.01, { message: "Valor deve ser maior que 0" }),
			discount: z.object({
				value: z.number().nullable(),
				type: z.enum(["percentage", "value"]),
			}),
			interest: z.object({
				value: z.number().nullable(),
				type: z.enum(["percentage", "value"]),
			}),
			liquidValue: z
				.number()
				.min(0, { message: "Valor não pode ser negativo" })
				.nullable(),
		}),
		frequency: z.nativeEnum(FREQUENCY).default(FREQUENCY.DO_NOT_REPEAT),
		repeatSettings: z
			.object({
				initialInstallment: z
					.number()
					.min(1, { message: "Valor da parcela inicial não pode ser 0" })
					.default(1),
				count: z
					.number()
					.min(2, { message: "Quantidade de parcelas deve ser maior que 1" })
					.default(2),
				interval: z
					.nativeEnum(INTERVAL, { message: "Periodicidade é obrigatória" })
					.default(INTERVAL.MONTHLY),
				customDay: z
					.number()
					.nullish()
					.refine(
						value => {
							if (value === null) {
								return false;
							}

							return true;
						},
						{ message: "Intervalo personalizado é obrigatório" }
					),
			})
			.nullish()
			.default(null),
		dueDate: z
			.date({ message: "Data de vencimento é obrigatória" })
			.default(new Date())
			.transform(date => new Date(date)),
		isConfirmed: z.boolean().optional().default(false),
		categoryId: z.string().nullish(),
		subCategoryId: z.string().nullish(),
		tagsAndSubTags: z
			.array(
				z.object({
					tagId: z.string(),
					subTagId: z.string().optional(),
				})
			)
			.nullish()
			.default([]),
		tags: z
			.array(
				z.object({
					value: z.string(),
					label: z.string(),
					icon: z.string(),
				})
			)
			.nullish()
			.default([]),
		subTags: z
			.array(
				z.object({
					tagId: z.string(),
					value: z.string(),
					label: z.string(),
					icon: z.string(),
				})
			)
			.nullish()
			.default([]),
		accountId: z.string().min(1, { message: "Conta é obrigatória" }),
		registrationDate: z
			.date({ message: "Data de competência é obrigatória" })
			.default(new Date())
			.transform(date => new Date(date)),
		confirmationDate: z
			.date({ message: "Data de confirmação é obrigatória" })
			.nullish()
			.default(null)
			.transform(date => (date ? new Date(date) : null)),
		customField: z.record(
			z.string(),
			z
				.object({
					fieldValue: z.union([z.string(), z.number(), z.null()]),
					required: z.boolean().optional().default(false),
				})
				.optional()
				.refine(
					value => {
						if (
							value?.required &&
							(value.fieldValue === null || value.fieldValue === "")
						) {
							return false;
						}

						return true;
					},
					{
						path: ["fieldValue"],
						message: "Valor é obrigatório",
					}
				)
		),
	})
	.superRefine((data, ctx) => {
		if (data.frequency === FREQUENCY.REPEAT && !data.repeatSettings) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Configurações de repetição são obrigatórias quando a frequência é 'Parcelar ou repetir'",
				path: ["repeatSettings"],
			});
		}

		if (data.isConfirmed && !data.confirmationDate) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Data de confirmação é obrigatória quando a transação é confirmada",
				path: ["confirmationDate"],
			});
		}

		if (
			data.frequency === FREQUENCY.REPEAT &&
			data.repeatSettings?.interval === INTERVAL.CUSTOM &&
			data.repeatSettings?.customDay === null
		) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Intervalo personalizado é obrigatório quando a periodicidade é 'Personalizado'",
				path: ["repeatSettings.customDay"],
			});
		}
	});

export type ITransactionsForm = z.infer<typeof transactionsSchema>;
