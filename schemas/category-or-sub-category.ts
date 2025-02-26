import { CONFIGS } from "@/configs";
import { z } from "zod";

export const categoryOrSubCategorySchema = z.object({
	name: z
		.string()
		.min(3, { message: "Nome é obrigatório" })
		.max(30, { message: "Nome deve ter no máximo 30 caracteres" })
		.regex(CONFIGS.REGEX.name.regex, {
			message: CONFIGS.REGEX.name.message,
		}),
	icon: z.string().min(1, { message: "Ícone é obrigatório" }),
});

export type ICategoryOrSubCategoryForm = z.infer<
	typeof categoryOrSubCategorySchema
>;
