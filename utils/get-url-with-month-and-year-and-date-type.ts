import { DATE_TYPE } from "@/types/enums/date-type";

interface GetUrlWithMonthAndYearProps {
	url: string;
	month?: number;
	year?: number;
	dateType?: DATE_TYPE;
}

export const getUrlWithMonthAndYearAndDateType = ({
	url,
	month,
	year,
	dateType,
}: GetUrlWithMonthAndYearProps) => {
	let newUrl = url;

	const isUrlWithParams = url.includes("?");

	if (month && year) {
		newUrl = `${newUrl}${isUrlWithParams ? "&" : "?"}month=${month}&year=${year}`;

		if (dateType)
			newUrl = `${newUrl}&dateType=${
				dateType === DATE_TYPE.NULL ? null : dateType
			}`;
	}

	return newUrl;
};
