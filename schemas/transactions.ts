import { CONFIGS } from "@/configs";
import { FREQUENCY, FREQUENCY_VALUES } from "@/types/enums/frequency";
import { INTERVAL, INTERVAL_VALUES } from "@/types/enums/interval";
import {
	type TRANSACTION_TYPE,
	TRANSACTION_TYPE_VALUES,
} from "@/types/enums/transaction-type";
import { z } from "zod";

export const transactionsSchema = z
	.object({
		type: z
			.enum(TRANSACTION_TYPE_VALUES)
			.transform(type => type as TRANSACTION_TYPE),
		name: z
			.string()
			.min(3, { message: "Nome deve ter no mínimo 3 caracteres" })
			.max(30, { message: "Nome deve ter no máximo 30 caracteres" })
			.regex(/^[\p{L}\p{N}\p{P}\p{S}\s]+$/u, {
				message: "Nome inválido",
			}),
		description: z
			.string()
			.max(255, {
				message: "Descrição deve ter no máximo 255 caracteres",
			})
			.optional(),
		assignedTo: z.string().min(1, { message: "Atribuído a é obrigatório" }),
		supplier: z
			.string()
			.min(3, { message: "Fornecedor deve ter no mínimo 3 caracteres" })
			.max(30, { message: "Fornecedor deve ter no máximo 30 caracteres" }),
		balance: z.object({
			value: z.number({ message: "Valor é obrigatório" }),
			parts: z.number().nullable(),
			labor: z.number().nullable(),
			discount: z.number().nullable(),
			interest: z.number().nullable(),
			total: z.number().nullable(),
		}),
		frequency: z
			.enum(FREQUENCY_VALUES)
			.default(FREQUENCY.DO_NOT_REPEAT)
			.transform(frequency => frequency as FREQUENCY),
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
					.enum(INTERVAL_VALUES)
					.default(INTERVAL.MONTH)
					.transform(interval => interval as INTERVAL),
			})
			.nullish()
			.default(null),
		dueDate: z
			.date({ message: "Data de vencimento é obrigatória" })
			.default(new Date())
			.transform(date => new Date(date)),
		isConfirmed: z.boolean().optional().default(false),
		categoryId: z.string().min(1, { message: "Categoria é obrigatória" }),
		subCategoryId: z.string().min(1, { message: "Subcategoria é obrigatória" }),
		tagId: z.string().optional(),
		subTagId: z.string().optional(),
		accountId: z.string().min(1, { message: "Conta é obrigatória" }),
		registrationDate: z
			.date({ message: "Data de registro é obrigatória" })
			.default(new Date())
			.transform(date => new Date(date)),
		confirmationDate: z
			.date({ message: "Data de confirmação é obrigatória" })
			.nullish()
			.default(null)
			.transform(date => (date ? new Date(date) : null)),
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

		if (data.tagId && !data.subTagId) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message: "Sub etiqueta é obrigatória quando a etiqueta é selecionada",
				path: ["subTagId"],
			});
		}
	});

export type ITransactionsForm = z.infer<typeof transactionsSchema>;
