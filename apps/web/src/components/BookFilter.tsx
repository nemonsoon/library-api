import { SegmentedControl } from "@mantine/core";
import type {
	BookFilter as BookFilterValue,
	LibraryCounts,
} from "../lib/book-status";

type Props = {
	value: BookFilterValue;
	counts: LibraryCounts;
	onChange: (value: BookFilterValue) => void;
};

export function BookFilter({ value, counts, onChange }: Props) {
	return (
		<SegmentedControl
			value={value}
			onChange={(next) => onChange(next as BookFilterValue)}
			data={[
				{ value: "all", label: `すべて ${counts.total}` },
				{ value: "onLoan", label: `貸出中 ${counts.onLoan}` },
				{ value: "available", label: `貸出可 ${counts.available}` },
			]}
		/>
	);
}
