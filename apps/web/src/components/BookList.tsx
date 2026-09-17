import { Table, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { statusOf } from "../lib/book-status";
import { daysOverdue, daysUntilDue, formatDate } from "../lib/datetime";
import type { Book } from "../lib/library";
import classes from "../styles/BookList.module.css";
import { StatusBadge } from "./StatusBadge";

type Props = {
	books: Book[];
	now: Date;
	selectedId: string | undefined;
};

function DueCell({ book, now }: { book: Book; now: Date }) {
	const loan = book.currentLoan;
	if (loan === null) {
		return <Text className={classes.blank}>—</Text>;
	}

	const overdue = daysOverdue(loan.dueDate, now);
	return (
		<div className={classes.due}>
			<Text className={classes.dueDate}>{formatDate(loan.dueDate)}</Text>
			{overdue > 0 ? (
				<Text className={`${classes.remaining} ${classes.overdue}`}>
					{overdue}日超過
				</Text>
			) : (
				<Text className={classes.remaining}>
					残り{daysUntilDue(loan.dueDate, now)}日
				</Text>
			)}
		</div>
	);
}

export function BookList({ books, now, selectedId }: Props) {
	return (
		<Table verticalSpacing="sm" layout="auto" className={classes.table}>
			<Table.Thead>
				<Table.Tr>
					<Table.Th>題名</Table.Th>
					<Table.Th className={classes.statusCell}>状態</Table.Th>
					<Table.Th>借り主</Table.Th>
					<Table.Th>返却期限</Table.Th>
					<Table.Th>登録日</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{books.map((book) => (
					<Table.Tr
						key={book.id}
						className={
							book.id === selectedId ? classes.selectedRow : classes.row
						}
					>
						<Table.Td className={classes.titleCell}>
							<Link
								to="/"
								search={(previous) => ({ ...previous, selected: book.id })}
								className={classes.rowLink}
							>
								{book.title}
							</Link>
						</Table.Td>
						<Table.Td className={classes.statusCell}>
							<StatusBadge status={statusOf(book, now)} />
						</Table.Td>
						<Table.Td>
							{book.currentLoan === null ? (
								<Text className={classes.blank}>—</Text>
							) : (
								<Text className={classes.borrower}>
									{book.currentLoan.userEmail}
								</Text>
							)}
						</Table.Td>
						<Table.Td>
							<DueCell book={book} now={now} />
						</Table.Td>
						<Table.Td>
							<Text className={classes.registered}>
								{formatDate(book.createdAt)}
							</Text>
						</Table.Td>
					</Table.Tr>
				))}
			</Table.Tbody>
		</Table>
	);
}
