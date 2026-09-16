import { describe, expect, it } from "vitest";
import { ListBooksUseCase } from "../src/application/usecases/book/listBooksUseCase.js";
import { Book } from "../src/domain/entities/book.js";
import { Loan } from "../src/domain/entities/loan.js";
import { User } from "../src/domain/entities/user.js";
import {
	InMemoryBookRepository,
	InMemoryLoanRepository,
	InMemoryUserRepository,
} from "./fakes/inMemoryRepositories.js";

const OLDER_LOAN_DATE = new Date("2026-01-01T00:00:00.000Z");
const NEWER_LOAN_DATE = new Date("2026-02-01T00:00:00.000Z");

function createUseCase(books: Book[], loans: Loan[], users: User[]) {
	return new ListBooksUseCase(
		new InMemoryBookRepository(books),
		new InMemoryLoanRepository(loans),
		new InMemoryUserRepository(users),
	);
}

describe("ListBooksUseCase", () => {
	it("蔵書が無ければ空の一覧を返す", async () => {
		const useCase = createUseCase([], [], []);

		expect(await useCase.execute()).toEqual([]);
	});

	it("貸出可の書籍には現在の貸出が付かない", async () => {
		const useCase = createUseCase(
			[new Book("book-1", "Clean Architecture")],
			[],
			[],
		);

		const [book] = await useCase.execute();

		expect(book?.isAvailable).toBe(true);
		expect(book?.currentLoan).toBeNull();
	});

	it("貸出中の書籍には借り主と返却期限が付く", async () => {
		const useCase = createUseCase(
			[new Book("book-1", "Clean Architecture", false)],
			[new Loan("loan-1", "book-1", "user-1", OLDER_LOAN_DATE)],
			[new User("user-1", "reader@example.com")],
		);

		const [book] = await useCase.execute();

		expect(book?.currentLoan?.userEmail).toBe("reader@example.com");
		expect(book?.currentLoan?.dueDate).toEqual(
			new Date("2026-01-15T00:00:00.000Z"),
		);
	});

	it("返却済みの貸出は現在の貸出に選ばない", async () => {
		const useCase = createUseCase(
			[new Book("book-1", "Clean Architecture")],
			[
				new Loan(
					"loan-1",
					"book-1",
					"user-1",
					OLDER_LOAN_DATE,
					new Date("2026-01-10T00:00:00.000Z"),
				),
			],
			[new User("user-1", "reader@example.com")],
		);

		const [book] = await useCase.execute();

		expect(book?.currentLoan).toBeNull();
	});

	// 「1冊につき未返却の貸出は1件」という制約はデータベースに無いため、
	// 複数残っていても一覧が壊れないことを確かめる
	it("未返却の貸出が複数あれば貸出日が最も新しいものを選ぶ", async () => {
		const useCase = createUseCase(
			[new Book("book-1", "Clean Architecture", false)],
			[
				new Loan("loan-old", "book-1", "user-1", OLDER_LOAN_DATE),
				new Loan("loan-new", "book-1", "user-2", NEWER_LOAN_DATE),
			],
			[
				new User("user-1", "first@example.com"),
				new User("user-2", "second@example.com"),
			],
		);

		const [book] = await useCase.execute();

		expect(book?.currentLoan?.id).toBe("loan-new");
		expect(book?.currentLoan?.userEmail).toBe("second@example.com");
	});
});
