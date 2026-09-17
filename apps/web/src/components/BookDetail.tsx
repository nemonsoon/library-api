import {
	Alert,
	Button,
	Code as CodeText,
	Divider,
	Select,
	Stack,
	Text,
} from "@mantine/core";
import { Link } from "@tanstack/react-router";
import { BookDown, BookUp, CalendarX, X } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { ICON_SIZE, ICON_STROKE } from "../constants";
import { statusOf } from "../lib/book-status";
import {
	daysOverdue,
	daysUntilDue,
	formatDate,
	loanElapsedRatio,
} from "../lib/datetime";
import type { Book, User } from "../lib/library";
import classes from "../styles/BookDetail.module.css";
import panel from "../styles/Panel.module.css";
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
		<div className={classes.row}>
			<Text className={classes.rowLabel}>{label}</Text>
			{children}
		</div>
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
		<div className={`${panel.panel} ${classes.panel}`}>
			<div className={panel.head}>
				<Text className={panel.heading}>本の詳細</Text>
				<Link
					to="/"
					search={(previous) => ({ status: previous.status })}
					className={classes.close}
					aria-label="詳細を閉じる"
				>
					<X size={ICON_SIZE} strokeWidth={ICON_STROKE} aria-hidden="true" />
				</Link>
			</div>
			<div className={panel.body}>
				<Stack gap="md">
					<Stack gap="xs">
						<h2 className={classes.title}>{book.title}</h2>
						<div>
							<StatusBadge status={statusOf(book, now)} />
						</div>
					</Stack>

					{loan === null ? (
						<Stack gap="sm">
							<Select
								label="貸し出す相手"
								placeholder="ユーザーを選ぶ"
								searchable
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
									<BookUp
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
							<div className={classes.period}>
								<div className={classes.track}>
									<div
										className={overdue > 0 ? classes.fillOverdue : classes.fill}
										style={{
											width: `${Math.round(
												loanElapsedRatio(loan.loanDate, loan.dueDate, now) *
													100,
											)}%`,
										}}
									/>
								</div>
								{overdue > 0 ? (
									<Text className={`${classes.periodLabel} ${classes.overdue}`}>
										返却期限を {overdue} 日超過している
									</Text>
								) : (
									<Text className={classes.periodLabel}>
										返却期限まで残り {daysUntilDue(loan.dueDate, now)} 日
									</Text>
								)}
							</div>
							<Stack gap={6}>
								<DetailRow label="借り主">
									<Text className={classes.mono}>{loan.userEmail}</Text>
								</DetailRow>
								<DetailRow label="貸出日">
									<Text className={classes.mono}>
										{formatDate(loan.loanDate)}
									</Text>
								</DetailRow>
								<DetailRow label="返却期限">
									<Text className={classes.mono}>
										{formatDate(loan.dueDate)}
									</Text>
								</DetailRow>
							</Stack>
							{overdue === 0 ? null : (
								<Alert
									color="shu"
									variant="light"
									radius="sm"
									icon={
										<CalendarX size={ICON_SIZE} strokeWidth={ICON_STROKE} />
									}
								>
									返却期限を過ぎている。借り主に返却を促す。
								</Alert>
							)}
							<Button
								color="midori"
								loading={pending}
								leftSection={
									<BookDown
										size={ICON_SIZE}
										strokeWidth={ICON_STROKE}
										aria-hidden="true"
									/>
								}
								onClick={() => void run(() => onReturn(loan.id))}
							>
								返してもらう
							</Button>
						</Stack>
					)}

					<Divider />
					<Stack gap={6}>
						<DetailRow label="登録日">
							<Text className={classes.mono}>{formatDate(book.createdAt)}</Text>
						</DetailRow>
						<Stack gap={2}>
							<Text className={classes.rowLabel}>識別子</Text>
							<CodeText fz="xs" className={classes.identifier}>
								{book.id}
							</CodeText>
						</Stack>
					</Stack>
				</Stack>
			</div>
		</div>
	);
}
