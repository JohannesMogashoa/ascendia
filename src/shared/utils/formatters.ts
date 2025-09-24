export const formatDateForInput = (date: Date): string =>
	new Intl.DateTimeFormat("en-CA").format(date);

export function truncateNumber(numStr: string, keepStart = 6, keepEnd = 4) {
	// Ensure it's a string
	const s = String(numStr);
	if (s.length <= keepStart + keepEnd) return s; // nothing to truncate

	return s.slice(0, keepStart) + "..." + s.slice(-keepEnd);
}
