import { z } from "zod";

export const categoryOrSubCategorySchema = z.object({
	name: z
		.string()
		.min(1, { message: "Nome é obrigatório" })
		.regex(/^[A-Za-zÀ-ÖØ-öø-ÿ0-9-_()\s]+$/, {
			message: "Nome não pode conter caracteres especiais",
		}),
	icon: z.string().min(1, { message: "Ícone é obrigatório" }),
});

export type ICategoryOrSubCategoryForm = z.infer<
	typeof categoryOrSubCategorySchema
>;
