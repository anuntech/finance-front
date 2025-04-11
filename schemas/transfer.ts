import { z } from "zod";

export const transferSchema = z.object({
	accountIdFrom: z
		.string()
		.min(1, { message: "A conta de origem é obrigatória" }),
	accountIdTo: z
		.string()
		.min(1, { message: "A conta de destino é obrigatória" }),
	amount: z.number().min(0.1, { message: "O valor não pode ser 0" }),
});

export type ITransferForm = z.infer<typeof transferSchema>;
