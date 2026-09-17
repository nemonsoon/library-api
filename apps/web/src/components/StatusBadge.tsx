import { Badge } from "@mantine/core";
import type { BookStatus } from "../lib/book-status";

const LABELS: Record<BookStatus, string> = {
	available: "貸出可",
	onLoan: "貸出中",
	overdue: "期限超過",
};

const COLORS: Record<BookStatus, string> = {
	available: "gray",
	onLoan: "ai",
	overdue: "shu",
};

// 見た目の強さを状態の重さに合わせる。
// 何も起きていない貸出可は点、進行中の貸出中は淡い面、手を打つ必要がある期限超過は塗り。
const VARIANTS: Record<BookStatus, string> = {
	available: "dot",
	onLoan: "light",
	overdue: "filled",
};

export function StatusBadge({ status }: { status: BookStatus }) {
	return (
		<Badge color={COLORS[status]} variant={VARIANTS[status]} radius="sm">
			{LABELS[status]}
		</Badge>
	);
}
