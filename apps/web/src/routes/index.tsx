import { Stack, Text } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import {
	createFileRoute,
	getRouteApi,
	useNavigate,
	useRouter,
} from "@tanstack/react-router";
import { LibraryBig, SearchX, TriangleAlert } from "lucide-react";
import { useEffect } from "react";
import { AppShell } from "../components/AppShell";
import { BookDetail } from "../components/BookDetail";
import { BookFilter } from "../components/BookFilter";
import { BookList } from "../components/BookList";
import { BookListSkeleton } from "../components/BookListSkeleton";
import { CreateBookForm } from "../components/CreateBookForm";
import { DueSoon } from "../components/DueSoon";
import { LibrarySummary } from "../components/LibrarySummary";
import { StateMessage } from "../components/StateMessage";
import { ICON_SIZE, ICON_SIZE_LARGE, ICON_STROKE } from "../constants";
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
import panel from "../styles/Panel.module.css";

export const Route = createFileRoute("/")({
	validateSearch: parseBookSearch,
	// 選んだ本は読み込みの依存に入れない。入れると選ぶたびに一覧の再取得が走る。
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
		error instanceof ApiError ? error.message : "本の一覧を読み込めなかった。";

	return (
		<AppShell aside={null}>
			<StateMessage
				icon={
					<TriangleAlert
						size={ICON_SIZE_LARGE}
						strokeWidth={ICON_STROKE}
						aria-hidden="true"
					/>
				}
				title="本の一覧を読み込めない"
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

	// 絞り込みで消えた本や、一覧に無い識別子が指されたままにならないようにする。
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
			notifications.show({ color: "midori", message: success });
			return true;
		} catch (error) {
			notifications.show({
				color: "shu",
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
			<CreateBookForm
				onCreate={(title) =>
					run(() => createBook(title), `「${title}」を登録した。`)
				}
			/>
		) : (
			<BookDetail
				book={selected}
				users={users}
				now={now}
				onLend={(bookId, userId) =>
					run(() => createLoan(bookId, userId), "貸し出した。")
				}
				onReturn={(loanId) => run(() => returnLoan(loanId), "返してもらった。")}
			/>
		);

	return (
		<AppShell
			summary={<LibrarySummary counts={counts} />}
			banner={<DueSoon books={books} now={now} selectedId={search.selected} />}
			aside={aside}
		>
			<div className={panel.panel}>
				<div className={panel.head}>
					<div className={panel.headLeft}>
						<LibraryBig
							size={ICON_SIZE}
							strokeWidth={ICON_STROKE}
							className={panel.headIcon}
							aria-hidden="true"
						/>
						<Text className={panel.heading}>本の一覧</Text>
					</div>
					<BookFilter
						value={filter}
						counts={counts}
						onChange={(next) =>
							void navigate({ search: next === "all" ? {} : { status: next } })
						}
					/>
				</div>
				{visible.length === 0 ? (
					<StateMessage
						icon={
							<SearchX
								size={ICON_SIZE_LARGE}
								strokeWidth={ICON_STROKE}
								aria-hidden="true"
							/>
						}
						title="条件に合う本がない"
						description="絞り込みを変えるか、右の欄から本を登録する。"
					/>
				) : (
					<Stack gap={0}>
						<BookList books={visible} now={now} selectedId={search.selected} />
					</Stack>
				)}
			</div>
		</AppShell>
	);
}
