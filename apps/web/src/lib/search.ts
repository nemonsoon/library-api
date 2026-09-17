import type { BookFilter } from "./book-status";

// 選んだ本と絞り込みは URL に持たせる。画面を共有したときに同じ状態で開ける。
export type BookSearch = {
	status?: BookFilter | undefined;
	selected?: string | undefined;
};

const FILTERS: BookFilter[] = ["all", "onLoan", "available"];

const UUID_PATTERN =
	/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export function parseBookSearch(search: Record<string, unknown>): BookSearch {
	const parsed: BookSearch = {};
	if (
		typeof search.status === "string" &&
		FILTERS.includes(search.status as BookFilter)
	) {
		parsed.status = search.status as BookFilter;
	}
	if (
		typeof search.selected === "string" &&
		UUID_PATTERN.test(search.selected)
	) {
		parsed.selected = search.selected;
	}
	return parsed;
}
