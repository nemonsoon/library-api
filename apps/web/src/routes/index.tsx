import { Group, Paper, Stack, Title } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	createFileRoute,
	getRouteApi,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { CircleAlert, Inbox } from "lucide-react";
import { useEffect } from "react";
import { AppShell } from "../components/AppShell";
import { BookDetail } from "../components/BookDetail";
import { BookFilter } from "../components/BookFilter";
import { BookList } from "../components/BookList";
import { BookListSkeleton } from "../components/BookListSkeleton";
import { CreateBookForm } from "../components/CreateBookForm";
import { Overview } from "../components/Overview";
import { StateMessage } from "../components/StateMessage";
import { ICON_STROKE } from "../constants";
import {
	type BookFilter as BookFilterValue,
	countBooks,
	matchesFilter,
	statusOf,
} from "../lib/book-status";
import {
	ApiError,
	createBook,
	createLoan,
	fetchBooks,
	fetchUsers,
	returnLoan,
} from "../lib/library";
import { parseBookSearch } from "../lib/search";

export const Route = createFileRoute("/")({
	validateSearch: parseBookSearch,
	// 選んだ書籍は読み込みの依存に入れない。入れると選ぶたびに一覧の再取得が走る。
	loader: async () => {
		const [books, users] = await Promise.all([fetchBooks(), fetchUsers()]);
		return { books, users };
	},
	component: LibraryPage,
	pendingComponent: LoadingPage,
	errorComponent: ErrorPage,
});

const route = getRouteApi("/");

function LoadingPage() {
	return (
		<AppShell aside={null}>
			<BookListSkeleton />
		</AppShell>
	);
}

function ErrorPage({ error }: { error: unknown }) {
	const router = useRouter();
	const description =
		error instanceof ApiError ? error.message : "蔵書を読み込めなかった。";

	return (
		<AppShell aside={null}>
			<StateMessage
				icon={
					<CircleAlert size={32} strokeWidth={ICON_STROKE} aria-hidden="true" />
				}
				title="蔵書を読み込めない"
				description={description}
				action={{
					label: "読み込み直す",
					onClick: () => void router.invalidate(),
				}}
			/>
		</AppShell>
	);
}

function LibraryPage() {
	const { books, users } = route.useLoaderData();
	const search = route.useSearch();
	const navigate = useNavigate({ from: "/" });
	const router = useRouter();

	const now = new Date();
	const filter: BookFilterValue = search.status ?? "all";
	const counts = countBooks(books, now);
	const visible = books.filter((book) =>
		matchesFilter(statusOf(book, now), filter),
	);
	const selected = books.find((book) => book.id === search.selected);

	// 絞り込みで消えた書籍や、一覧に無い識別子が指されたままにならないようにする。
	useEffect(() => {
		if (search.selected !== undefined && selected === undefined) {
			void navigate({
				search: (previous) => ({ status: previous.status }),
				replace: true,
			});
		}
	}, [search.selected, selected, navigate]);

	async function run(
		action: () => Promise<void>,
		success: string,
	): Promise<boolean> {
		try {
			await action();
			await router.invalidate();
			notifications.show({ color: "teal", message: success });
			return true;
		} catch (error) {
			notifications.show({
				color: "red",
				title: "処理できなかった",
				message:
					error instanceof ApiError
						? error.message
						: "予期しない問題が起きた。",
			});
			return false;
		}
	}

	const aside =
		selected === undefined ? (
			<Stack gap="md">
				<Overview counts={counts} />
				<CreateBookForm
					onCreate={(title) =>
						run(() => createBook(title), `「${title}」を登録した。`)
					}
				/>
			</Stack>
		) : (
			<BookDetail
				book={selected}
				users={users}
				now={now}
				onLend={(bookId, userId) =>
					run(() => createLoan(bookId, userId), "貸し出した。")
				}
				onReturn={(loanId) => run(() => returnLoan(loanId), "返却した。")}
			/>
		);

	return (
		<AppShell aside={aside}>
			<Stack gap="md">
				<Group justify="space-between" align="center">
					<Title order={2}>蔵書</Title>
					<BookFilter
						value={filter}
						counts={counts}
						onChange={(next) =>
							void navigate({ search: next === "all" ? {} : { status: next } })
						}
					/>
				</Group>
				<Paper withBorder radius="md" p="xs">
					{visible.length === 0 ? (
						<StateMessage
							icon={
								<Inbox size={32} strokeWidth={ICON_STROKE} aria-hidden="true" />
							}
							title="該当する書籍がない"
							description="絞り込みを変えるか、右の窓口から書籍を登録する。"
						/>
					) : (
						<BookList books={visible} now={now} selectedId={search.selected} />
					)}
				</Paper>
			</Stack>
		</AppShell>
	);
}
