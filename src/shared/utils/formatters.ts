export const formatDateForInput = (date: Date): string =>
	new Intl.DateTimeFormat("en-CA").format(date);
