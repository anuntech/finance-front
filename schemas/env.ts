import z from "zod";

const envSchema = z.object({
	NEXT_PUBLIC_REDIRECT_WHEN_NOT_AUTHENTICATED_ROUTE: z.string().url(),
	NEXT_PUBLIC_DOMAIN_NAME: z.string(),
	NEXT_PUBLIC_SITE_URL: z.string().url(),
	NEXT_PUBLIC_API_URL: z.string().url(),
});

export const env = envSchema.parse(process.env);
