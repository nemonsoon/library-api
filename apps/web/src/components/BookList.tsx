import { Stack, Table, Text } from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { statusOf } from "../lib/book-status";
import { daysOverdue, formatDate } from "../lib/datetime";
import type { Book } from "../lib/library";
import classes from "../styles/BookList.module.css";
import { StatusBadge } from "./StatusBadge";

type Props = {
	books: Book[];
	now: Date;
	selectedId: string | undefined;
};

export function BookList({ books, now, selectedId }: Props) {
	return (
		<Table highlightOnHover verticalSpacing="sm" layout="auto">
			<Table.Thead>
				<Table.Tr>
					<Table.Th>タイトル</Table.Th>
					<Table.Th className={classes.statusCell}>状態</Table.Th>
					<Table.Th>借り主</Table.Th>
					<Table.Th>返却期限</Table.Th>
					<Table.Th>登録日</Table.Th>
				</Table.Tr>
			</Table.Thead>
			<Table.Tbody>
				{books.map((book) => {
					const loan = book.currentLoan;
					const overdue = loan === null ? 0 : daysOverdue(loan.dueDate, now);
					return (
						<Table.Tr
							key={book.id}
							className={
								book.id === selectedId ? classes.selectedRow : undefined
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
								{loan === null ? (
									<Text size="sm" c="dimmed">
										—
									</Text>
								) : (
									<Text size="sm">{loan.userEmail}</Text>
								)}
							</Table.Td>
							<Table.Td>
								{loan === null ? (
									<Text size="sm" c="dimmed">
										—
									</Text>
								) : (
									<Stack gap={2}>
										<Text size="sm">{formatDate(loan.dueDate)}</Text>
										{overdue === 0 ? null : (
											<Text size="xs" c="red">
												{overdue}日超過
											</Text>
										)}
									</Stack>
								)}
							</Table.Td>
							<Table.Td>
								<Text size="sm">{formatDate(book.createdAt)}</Text>
							</Table.Td>
						</Table.Tr>
					);
				})}
			</Table.Tbody>
		</Table>
	);
}
