import { CONFIGS } from "./configs";
import { version } from "./package.json" assert { type: "json" };
import type { ConfigProps } from "./types/config";

const config = {
	// REQUIRED
	appName: "Finance",
	// REQUIRED: a short description of your app for SEO tags (can be overwritten)
	appDescription:
		"The NextJS boilerplate with all you need to build your SaaS, AI tool, or any other web app.",
	// REQUIRED (no https://, not trialing slash at the end, just the naked domain)
	domainName: CONFIGS.ENVS.DOMAIN_NAME,
	version,
} as ConfigProps;

export default config;
