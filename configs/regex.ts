interface Regex {
	name: {
		regex: RegExp;
		message: string;
	};
}

export const REGEX: Regex = {
	name: {
		regex: /^[A-Za-zÀ-ÖØ-öø-ÿ0-9-_\s]+$/,
		message: "Nome não pode conter caracteres especiais",
	},
};
