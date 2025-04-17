import { DATE_CONFIG } from "@/types/enums/date-config";
import { DATE_TYPE } from "@/types/enums/date-type";
import dayjs from "dayjs";
import ptBR from "dayjs/locale/pt-br";

dayjs.locale(ptBR);

interface GetUrlWithMonthAndYearProps {
	url: string;
	month?: number;
	year?: number;
	from?: Date;
	to?: Date;
	dateType?: DATE_TYPE;
	dateConfig?: DATE_CONFIG;
	search?: string;
}

export const getUrlWithParams = ({
	url,
	month,
	year,
	from,
	to,
	dateType,
	dateConfig,
	search,
}: GetUrlWithMonthAndYearProps) => {
	let newUrl = url;

	const isUrlWithParams = url.includes("?");

	switch (dateConfig) {
		case DATE_CONFIG.ALL:
			break;
		case DATE_CONFIG.RANGE:
			newUrl = `${newUrl}${isUrlWithParams ? "&" : "?"}initialDate=${dayjs(from).format("YYYY/MM/DD").replace(/\//g, "-")}&finalDate=${dayjs(to).format("YYYY/MM/DD").replace(/\//g, "-")}`;

			break;
		case DATE_CONFIG.SINGLE:
			newUrl = `${newUrl}${isUrlWithParams ? "&" : "?"}month=${month}&year=${year}`;

			break;
		default:
			break;
	}

	if (dateType && dateType !== DATE_TYPE.NULL) {
		if (dateConfig === DATE_CONFIG.ALL)
			newUrl = `${newUrl}?dateType=${dateType}`;

		if (dateConfig !== DATE_CONFIG.ALL)
			newUrl = `${newUrl}&dateType=${dateType}`;
	}

	if (search) {
		newUrl = `${url}${isUrlWithParams ? "&" : "?"}search=${search}`;
	}

	return newUrl;
};
