import type { Book } from "./library";

export type BookStatus = "available" | "onLoan" | "overdue";

export type BookFilter = "all" | "onLoan" | "available";

// 返却期限の超過は貸出の可否に影響しないため、業務ルールとしては持たず画面側で判定する。
export function statusOf(book: Book, now: Date): BookStatus {
	if (book.currentLoan === null) {
		return "available";
	}
	return new Date(book.currentLoan.dueDate).getTime() < now.getTime()
		? "overdue"
		: "onLoan";
}

export function matchesFilter(status: BookStatus, filter: BookFilter): boolean {
	if (filter === "all") {
		return true;
	}
	if (filter === "available") {
		return status === "available";
	}
	return status === "onLoan" || status === "overdue";
}

export type LibraryCounts = {
	total: number;
	onLoan: number;
	available: number;
	overdue: number;
};

export function countBooks(books: Book[], now: Date): LibraryCounts {
	const counts: LibraryCounts = {
		total: books.length,
		onLoan: 0,
		available: 0,
		overdue: 0,
	};
	for (const book of books) {
		const status = statusOf(book, now);
		if (status === "available") {
			counts.available += 1;
		} else {
			counts.onLoan += 1;
			if (status === "overdue") {
				counts.overdue += 1;
			}
		}
	}
	return counts;
}
