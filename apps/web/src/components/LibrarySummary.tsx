import { Text } from "@mantine/core";
import type { LibraryCounts } from "../lib/book-status";
import classes from "../styles/LibrarySummary.module.css";

type Props = {
	counts: LibraryCounts;
};

type Tone = "plain" | "quiet" | "loan" | "overdue";

function Stat({
	label,
	value,
	tone,
}: {
	label: string;
	value: number;
	tone: Tone;
}) {
	return (
		<div className={classes.stat}>
			<Text className={classes.label}>{label}</Text>
			<Text className={`${classes.value} ${classes[tone]}`}>{value}</Text>
		</div>
	);
}

export function LibrarySummary({ counts }: Props) {
	return (
		<div className={classes.summary}>
			<Stat label="本" value={counts.total} tone="plain" />
			<Stat label="貸出中" value={counts.onLoan} tone="loan" />
			{/* 超過が0件の日は朱を出さない。常に出ていると、出ていることの意味が薄れる。 */}
			<Stat
				label="超過"
				value={counts.overdue}
				tone={counts.overdue === 0 ? "quiet" : "overdue"}
			/>
		</div>
	);
}
