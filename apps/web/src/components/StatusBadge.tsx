import { Badge } from "@mantine/core";
import type { BookStatus } from "../lib/book-status";

const LABELS: Record<BookStatus, string> = {
	available: "貸出可",
	onLoan: "貸出中",
	overdue: "期限超過",
};

const COLORS: Record<BookStatus, string> = {
	available: "gray",
	onLoan: "blue",
	overdue: "red",
};

export function StatusBadge({ status }: { status: BookStatus }) {
	return (
		<Badge color={COLORS[status]} variant="light">
			{LABELS[status]}
		</Badge>
	);
}
