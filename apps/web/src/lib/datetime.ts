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

// 残りの日数も切り上げる。期限まで1時間でも残っていれば1日と数える。
export function daysUntilDue(dueDate: string, now: Date): number {
	const difference = new Date(dueDate).getTime() - now.getTime();
	return difference <= 0 ? 0 : Math.ceil(difference / MILLISECONDS_PER_DAY);
}

// 貸出期間のうち、どこまで来たかを 0〜1 で返す。
// 期間の長さは貸出日と返却期限の差から取る。日数を画面に書くと、業務ルールが二重になる。
export function loanElapsedRatio(
	loanDate: string,
	dueDate: string,
	now: Date,
): number {
	const start = new Date(loanDate).getTime();
	const end = new Date(dueDate).getTime();
	if (end <= start) {
		return 1;
	}
	const ratio = (now.getTime() - start) / (end - start);
	return Math.min(1, Math.max(0, ratio));
}
