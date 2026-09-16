import { describe, expect, it } from "vitest";
import { BookNotFoundError } from "../src/application/errors/bookNotFoundError.js";
import { UserNotFoundError } from "../src/application/errors/userNotFoundError.js";
import { LoanBookUseCase } from "../src/application/usecases/loan/loanBookUseCase.js";
import { Book } from "../src/domain/entities/book.js";
import { Loan } from "../src/domain/entities/loan.js";
import { User } from "../src/domain/entities/user.js";
import { BookAlreadyLoanedError } from "../src/domain/errors/bookAlreadyLoanedError.js";
import { LoanLimitExceededError } from "../src/domain/errors/loanLimitExceededError.js";
import {
	InMemoryBookRepository,
	InMemoryLoanRepository,
	InMemoryUserRepository,
	immediateTransactionManager,
	SequentialIdGenerator,
} from "./fakes/inMemoryRepositories.js";

const LOAN_DATE = new Date("2026-01-01T00:00:00.000Z");

function activeLoansOf(userId: string, count: number): Loan[] {
	return Array.from(
		{ length: count },
		(_unused, index) =>
			new Loan(`loan-${index}`, `other-book-${index}`, userId, LOAN_DATE),
	);
}

function createUseCase(options: {
	books?: Book[];
	users?: User[];
	loans?: Loan[];
}) {
	return new LoanBookUseCase(
		new InMemoryLoanRepository(options.loans ?? []),
		new InMemoryBookRepository(options.books ?? []),
		new InMemoryUserRepository(options.users ?? []),
		new SequentialIdGenerator(),
		immediateTransactionManager,
	);
}

const availableBook = () => new Book("book-1", "Clean Architecture");
const borrower = () => new User("user-1", "reader@example.com");

describe("LoanBookUseCase", () => {
	it("貸し出すと返却期限が貸出日の14日後になる", async () => {
		const useCase = createUseCase({
			books: [availableBook()],
			users: [borrower()],
		});

		const loan = await useCase.execute({ bookId: "book-1", userId: "user-1" });

		const expectedDueDate = new Date(loan.loanDate);
		expectedDueDate.setDate(expectedDueDate.getDate() + 14);
		expect(loan.dueDate).toEqual(expectedDueDate);
	});

	it("貸出中の書籍は再度貸し出せない", async () => {
		const useCase = createUseCase({
			books: [new Book("book-1", "Clean Architecture", false)],
			users: [borrower()],
		});

		await expect(
			useCase.execute({ bookId: "book-1", userId: "user-1" }),
		).rejects.toThrow(BookAlreadyLoanedError);
	});

	it("未返却の貸出が4冊なら貸し出せる", async () => {
		const useCase = createUseCase({
			books: [availableBook()],
			users: [borrower()],
			loans: activeLoansOf("user-1", 4),
		});

		const loan = await useCase.execute({ bookId: "book-1", userId: "user-1" });

		expect(loan.bookId).toBe("book-1");
	});

	it("未返却の貸出が5冊あると貸し出せない", async () => {
		const useCase = createUseCase({
			books: [availableBook()],
			users: [borrower()],
			loans: activeLoansOf("user-1", 5),
		});

		await expect(
			useCase.execute({ bookId: "book-1", userId: "user-1" }),
		).rejects.toThrow(LoanLimitExceededError);
	});

	it("返却済みの貸出は上限に数えない", async () => {
		const returnedLoans = activeLoansOf("user-1", 5).map(
			(loan) =>
				new Loan(
					loan.id,
					loan.bookId,
					loan.userId,
					loan.loanDate,
					new Date("2026-01-05T00:00:00.000Z"),
				),
		);
		const useCase = createUseCase({
			books: [availableBook()],
			users: [borrower()],
			loans: returnedLoans,
		});

		const loan = await useCase.execute({ bookId: "book-1", userId: "user-1" });

		expect(loan.bookId).toBe("book-1");
	});

	it("存在しない書籍は貸し出せない", async () => {
		const useCase = createUseCase({ users: [borrower()] });

		await expect(
			useCase.execute({ bookId: "missing", userId: "user-1" }),
		).rejects.toThrow(BookNotFoundError);
	});

	it("存在しないユーザーには貸し出せない", async () => {
		const useCase = createUseCase({ books: [availableBook()] });

		await expect(
			useCase.execute({ bookId: "book-1", userId: "missing" }),
		).rejects.toThrow(UserNotFoundError);
	});
});
