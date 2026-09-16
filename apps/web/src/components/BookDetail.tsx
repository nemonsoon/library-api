import {
	Alert,
	Button,
	Code as CodeText,
	Divider,
	Group,
	Paper,
	Select,
	Stack,
	Text,
	Title,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { ArrowLeft, BookOpen, TriangleAlert, Undo2 } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { ICON_SIZE, ICON_STROKE } from "../constants";
import { statusOf } from "../lib/book-status";
import { daysOverdue, formatDate } from "../lib/datetime";
import type { Book, User } from "../lib/library";
import classes from "../styles/BookDetail.module.css";
import listClasses from "../styles/BookList.module.css";
import { StatusBadge } from "./StatusBadge";

type Props = {
	book: Book;
	users: User[];
	now: Date;
	onLend: (bookId: string, userId: string) => Promise<boolean>;
	onReturn: (loanId: string) => Promise<boolean>;
};

function DetailRow({
	label,
	children,
}: {
	label: string;
	children: ReactNode;
}) {
	return (
		<Group justify="space-between" gap="sm" wrap="nowrap">
			<Text size="sm" c="dimmed" className={classes.rowLabel}>
				{label}
			</Text>
			{children}
		</Group>
	);
}

export function BookDetail({ book, users, now, onLend, onReturn }: Props) {
	const [userId, setUserId] = useState<string | null>(null);
	const [pending, setPending] = useState(false);
	const loan = book.currentLoan;
	const overdue = loan === null ? 0 : daysOverdue(loan.dueDate, now);

	async function run(action: () => Promise<boolean>) {
		setPending(true);
		try {
			await action();
		} finally {
			setPending(false);
		}
	}

	return (
		<Paper withBorder radius="md" p="md">
			<Stack gap="sm">
				<Link
					to="/"
					search={(previous) => ({ status: previous.status })}
					className={listClasses.rowLink}
				>
					<Group gap={4}>
						<ArrowLeft
							size={ICON_SIZE}
							strokeWidth={ICON_STROKE}
							aria-hidden="true"
						/>
						<Text size="sm">蔵書の状況へ戻る</Text>
					</Group>
				</Link>
				<Title order={4}>{book.title}</Title>
				<Group>
					<StatusBadge status={statusOf(book, now)} />
				</Group>
				<Divider />
				<Stack gap={6}>
					<DetailRow label="登録日">
						<Text size="sm">{formatDate(book.createdAt)}</Text>
					</DetailRow>
					<Stack gap={2}>
						<Text size="sm" c="dimmed">
							識別子
						</Text>
						<CodeText fz="xs" className={classes.identifier}>
							{book.id}
						</CodeText>
					</Stack>
				</Stack>
				<Divider />
				{loan === null ? (
					<Stack gap="sm">
						<Text fw={600} size="sm">
							貸出
						</Text>
						<Select
							label="貸し出す相手"
							placeholder="ユーザーを選ぶ"
							data={users.map((user) => ({
								value: user.id,
								label: user.email,
							}))}
							value={userId}
							onChange={setUserId}
							nothingFoundMessage="ユーザーが登録されていない"
						/>
						<Button
							loading={pending}
							disabled={userId === null}
							leftSection={
								<BookOpen
									size={ICON_SIZE}
									strokeWidth={ICON_STROKE}
									aria-hidden="true"
								/>
							}
							onClick={() => {
								if (userId !== null) {
									void run(() => onLend(book.id, userId));
								}
							}}
						>
							貸し出す
						</Button>
						<Text size="xs" c="dimmed">
							返却期限は貸出日の14日後に設定される。
						</Text>
					</Stack>
				) : (
					<Stack gap="sm">
						<Text fw={600} size="sm">
							返却
						</Text>
						<Stack gap={6}>
							<DetailRow label="借り主">
								<Text size="sm">{loan.userEmail}</Text>
							</DetailRow>
							<DetailRow label="貸出日">
								<Text size="sm">{formatDate(loan.loanDate)}</Text>
							</DetailRow>
							<DetailRow label="返却期限">
								<Text size="sm">{formatDate(loan.dueDate)}</Text>
							</DetailRow>
						</Stack>
						{overdue === 0 ? null : (
							<Alert
								color="red"
								variant="light"
								icon={
									<TriangleAlert size={ICON_SIZE} strokeWidth={ICON_STROKE} />
								}
							>
								返却期限を {overdue} 日超過している。
							</Alert>
						)}
						<Button
							color="teal"
							loading={pending}
							leftSection={
								<Undo2
									size={ICON_SIZE}
									strokeWidth={ICON_STROKE}
									aria-hidden="true"
								/>
							}
							onClick={() => void run(() => onReturn(loan.id))}
						>
							返却する
						</Button>
					</Stack>
				)}
			</Stack>
		</Paper>
	);
}
