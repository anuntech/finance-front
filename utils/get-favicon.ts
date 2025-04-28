export const getFavicon = (url: string) => {
	try {
		const domain = new URL(url).hostname;

		return `https://s2.googleusercontent.com/s2/favicons?sz=128&domain=${domain}`;
	} catch (error) {
		console.error(error);

		return null;
	}
};
