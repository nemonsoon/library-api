import {
	Divider,
	Group,
	Paper,
	RingProgress,
	Stack,
	Text,
} from "@mantine/core";
import { RING_SIZE, RING_THICKNESS } from "../constants";
import type { LibraryCounts } from "../lib/book-status";

type Props = {
	counts: LibraryCounts;
};

function ratio(part: number, total: number): number {
	return total === 0 ? 0 : (part / total) * 100;
}

function SummaryRow({
	label,
	value,
	alert,
}: {
	label: string;
	value: string;
	alert: boolean;
}) {
	return (
		<Group justify="space-between" gap="sm">
			<Text size="sm" c="dimmed">
				{label}
			</Text>
			{alert ? (
				<Text size="sm" fw={600} c="red">
					{value}
				</Text>
			) : (
				<Text size="sm" fw={600}>
					{value}
				</Text>
			)}
		</Group>
	);
}

export function Overview({ counts }: Props) {
	const onTime = counts.onLoan - counts.overdue;

	return (
		<Paper withBorder radius="md" p="md">
			<Stack gap="sm">
				<Text fw={600} size="sm">
					蔵書の状況
				</Text>
				<Group justify="center">
					<RingProgress
						size={RING_SIZE}
						thickness={RING_THICKNESS}
						roundCaps
						sections={[
							{ value: ratio(onTime, counts.total), color: "blue" },
							{ value: ratio(counts.overdue, counts.total), color: "red" },
						]}
						label={
							<Text ta="center" fw={700}>
								{counts.onLoan}/{counts.total}
							</Text>
						}
					/>
				</Group>
				<Text size="xs" c="dimmed" ta="center">
					貸出中の冊数
				</Text>
				<Divider />
				<Stack gap={6}>
					<SummaryRow label="蔵書" value={`${counts.total} 冊`} alert={false} />
					<SummaryRow
						label="貸出中"
						value={`${counts.onLoan} 冊`}
						alert={false}
					/>
					<SummaryRow
						label="貸出可"
						value={`${counts.available} 冊`}
						alert={false}
					/>
					<SummaryRow
						label="返却期限の超過"
						value={`${counts.overdue} 件`}
						alert={counts.overdue > 0}
					/>
				</Stack>
			</Stack>
		</Paper>
	);
}
