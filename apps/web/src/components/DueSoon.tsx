import { Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { BookOpenCheck, CalendarClock } from "lucide-react";
import { ICON_SIZE, ICON_SIZE_LARGE, ICON_STROKE } from "../constants";
import { daysOverdue, daysUntilDue, loanElapsedRatio } from "../lib/datetime";
import type { Book, CurrentLoan } from "../lib/library";
import classes from "../styles/DueSoon.module.css";
import panel from "../styles/Panel.module.css";

type Props = {
	books: Book[];
	now: Date;
	selectedId: string | undefined;
};

type DueEntry = {
	book: Book;
	loan: CurrentLoan;
	overdue: number;
	remaining: number;
	elapsed: number;
};

function collect(books: Book[], now: Date): DueEntry[] {
	const entries: DueEntry[] = [];
	for (const book of books) {
		const loan = book.currentLoan;
		if (loan === null) {
			continue;
		}
		entries.push({
			book,
			loan,
			overdue: daysOverdue(loan.dueDate, now),
			remaining: daysUntilDue(loan.dueDate, now),
			elapsed: loanElapsedRatio(loan.loanDate, loan.dueDate, now),
		});
	}
	// 返却期限の近い順に並べる。超過しているものは期限が最も古いので先頭に出る。
	return entries.sort(
		(left, right) =>
			new Date(left.loan.dueDate).getTime() -
			new Date(right.loan.dueDate).getTime(),
	);
}

function DueCard({ entry, selected }: { entry: DueEntry; selected: boolean }) {
	const { book, loan, overdue, remaining, elapsed } = entry;
	const cardClass = [
		classes.card,
		overdue > 0 ? classes.cardOverdue : classes.cardOnLoan,
		selected ? classes.cardSelected : "",
	].join(" ");

	return (
		<Link
			to="/"
			search={(previous) => ({ ...previous, selected: book.id })}
			className={cardClass}
		>
			{overdue > 0 ? (
				<Text className={`${classes.days} ${classes.daysOverdue}`}>
					{overdue}
					<span className={classes.unit}>日超過</span>
				</Text>
			) : (
				<Text className={classes.days}>
					{remaining}
					<span className={classes.unit}>日</span>
				</Text>
			)}
			<div className={classes.track}>
				<div
					className={overdue > 0 ? classes.fillOverdue : classes.fill}
					style={{ width: `${Math.round(elapsed * 100)}%` }}
				/>
			</div>
			<Text className={classes.title}>{book.title}</Text>
			<Text className={classes.borrower}>{loan.userEmail}</Text>
		</Link>
	);
}

export function DueSoon({ books, now, selectedId }: Props) {
	const entries = collect(books, now);

	return (
		<div className={panel.panel}>
			<div className={panel.head}>
				<div className={panel.headLeft}>
					<CalendarClock
						size={ICON_SIZE}
						strokeWidth={ICON_STROKE}
						className={panel.headIcon}
						aria-hidden="true"
					/>
					<Text className={panel.heading}>返却予定</Text>
					<Text className={panel.note}>返却期限の近い順</Text>
				</div>
			</div>
			{entries.length === 0 ? (
				<div className={classes.empty}>
					<BookOpenCheck
						size={ICON_SIZE_LARGE}
						strokeWidth={ICON_STROKE}
						aria-hidden="true"
					/>
					<Text size="sm" fw={500}>
						貸し出している本はない
					</Text>
					<Text size="sm" c="dimmed">
						返却を待っている本が1冊も無い。すべての本が貸し出せる。
					</Text>
				</div>
			) : (
				<ul className={classes.rail}>
					{entries.map((entry) => (
						<li key={entry.loan.id}>
							<DueCard entry={entry} selected={entry.book.id === selectedId} />
						</li>
					))}
				</ul>
			)}
		</div>
	);
}
