export const arrayMove = (array: Array<string>, from: number, to: number) => {
	const newArray = [...array];
	const [removed] = newArray.splice(from, 1);

	newArray.splice(to, 0, removed);

	return newArray;
};
