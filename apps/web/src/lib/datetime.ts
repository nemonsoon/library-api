const DATE_FORMAT = new Intl.DateTimeFormat("ja-JP", {
	year: "numeric",
	month: "2-digit",
	day: "2-digit",
});

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function formatDate(iso: string): string {
	return DATE_FORMAT.format(new Date(iso));
}

// 超過した日数は切り上げる。期限を1時間でも過ぎていれば1日と数える。
export function daysOverdue(dueDate: string, now: Date): number {
	const difference = now.getTime() - new Date(dueDate).getTime();
	return difference <= 0 ? 0 : Math.ceil(difference / MILLISECONDS_PER_DAY);
}
