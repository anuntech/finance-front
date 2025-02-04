import { configs } from "./configs";
import type { ConfigProps } from "./types/config";

const config = {
	// REQUIRED
	appName: "Finance",
	// REQUIRED: a short description of your app for SEO tags (can be overwritten)
	appDescription:
		"The NextJS boilerplate with all you need to build your SaaS, AI tool, or any other web app.",
	// REQUIRED (no https://, not trialing slash at the end, just the naked domain)
	domainName: configs.DOMAIN_NAME,
} as ConfigProps;

export default config;
