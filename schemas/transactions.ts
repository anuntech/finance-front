import { REGEX } from "@/configs";
import { FREQUENCY, FREQUENCY_VALUES } from "@/types/enums/frequency";
import { INTERVAL, INTERVAL_VALUES } from "@/types/enums/interval";
import { TRANSACTION_TYPE_VALUES } from "@/types/enums/transaction-type";
import { z } from "zod";

export const transactionsSchema = z
	.object({
		type: z.enum(TRANSACTION_TYPE_VALUES),
		name: z
			.string()
			.min(3, { message: "Nome deve ter no mínimo 3 caracteres" })
			.max(30, { message: "Nome deve ter no máximo 30 caracteres" })
			.regex(REGEX.name.regex, {
				message: REGEX.name.message,
			}),
		description: z
			.string()
			.max(255, {
				message: "Descrição deve ter no máximo 255 caracteres",
			})
			.optional(),
		assignedTo: z
			.string()
			.min(3, { message: "Atribuído a deve ter no mínimo 3 caracteres" })
			.max(30, { message: "Atribuído a deve ter no máximo 30 caracteres" }),
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
		frequency: z.enum(FREQUENCY_VALUES).default(FREQUENCY.DO_NOT_REPEAT),
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
				interval: z.enum(INTERVAL_VALUES).default(INTERVAL.MONTH),
			})
			.optional(),
		dueDate: z.date({ message: "Data de vencimento é obrigatória" }),
		isConfirmed: z.boolean({ message: "Confirmação é obrigatória" }).optional(),
		categoryId: z.string().min(1, { message: "Categoria é obrigatória" }),
		subCategoryId: z.string().min(1, { message: "Subcategoria é obrigatória" }),
		tagId: z.string().min(1, { message: "Etiqueta é obrigatória" }),
		subTagId: z.string().min(1, { message: "Sub etiqueta é obrigatória" }),
		accountId: z.string().min(1, { message: "Conta é obrigatória" }),
		registrationDate: z.date({ message: "Data de registro é obrigatória" }),
		confirmationDate: z
			.date({ message: "Data de confirmação é obrigatória" })
			.optional(),
	})
	.superRefine((data, ctx) => {
		if (data.frequency === "REPEAT" && !data.repeatSettings) {
			ctx.addIssue({
				code: z.ZodIssueCode.custom,
				message:
					"Configurações de repetição são obrigatórias quando a frequência é 'REPEAT'",
				path: ["repeatSettings"],
			});
		}

		if (data.isConfirmed && !data.confirmationDate) {
			data.confirmationDate = data.dueDate;
		}
	});

export type ITransactionsForm = z.infer<typeof transactionsSchema>;
