interface GetUrlWithMonthAndYearProps {
	url: string;
	month?: number;
	year?: number;
}

export const getUrlWithMonthAndYear = ({
	url,
	month,
	year,
}: GetUrlWithMonthAndYearProps) => {
	const isUrlWithParams = url.includes("?");

	if (month && year) {
		return `${url}${isUrlWithParams ? "&" : "?"}month=${month}&year=${year}`;
	}

	return url;
};
