import axios from "axios";

export const api = axios.create({
	baseURL: process.env.NEXT_PUBLIC_API_URL || "",
	withCredentials: process.env.NODE_ENV === "production",
});

api.interceptors.request.use(async config => {
	const workspaceId = localStorage.getItem("workspaceId");

	if (workspaceId) {
		config.headers.workspaceId = workspaceId;
	}

	if (process.env.NODE_ENV === "development") {
		const token = localStorage.getItem("token");

		if (token) {
			config.headers.Authorization = token;
		}
	}

	return config;
});
