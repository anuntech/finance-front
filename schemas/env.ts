import z from "zod";

const envSchema = z.object({
	REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE: z.string().url(),
	DOMAIN_NAME: z.string(),
	SITE_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
