import { describe, expect, it } from "vitest";
import { ReturnBookUseCase } from "../src/application/usecases/loan/returnBookUseCase.js";
import type { TransactionManagerInterface } from "../src/application/utils/transactionManagerInterface.js";
import { Book } from "../src/domain/entities/book.js";
import { Loan } from "../src/domain/entities/loan.js";
import type { BookRepositoryInterface } from "../src/domain/repositories/bookRepositoryInterface.js";
import type { LoanRepositoryInterface } from "../src/domain/repositories/loanRepositoryInterface.js";

const LOAN_DATE = new Date("2026-01-01T00:00:00.000Z");
const CREATED_AT = new Date("2026-01-01T00:00:00.000Z");
const STALE_UPDATED_AT = new Date("2026-01-01T00:00:00.000Z");
const PERSISTED_UPDATED_AT = new Date("2026-01-15T09:30:00.000Z");

// トランザクション境界の検証は対象外なので、そのまま実行するだけの実装で足りる
const transactionManager: TransactionManagerInterface = {
	run: async (operation) => operation({}),
};

function createLoan(): Loan {
	return new Loan(
		"loan-1",
		"book-1",
		"user-1",
		LOAN_DATE,
		null,
		CREATED_AT,
		STALE_UPDATED_AT,
	);
}

// 永続化層は更新日時をデータベース側で採番するため、書き戻した値を返す
function createLoanRepository(): LoanRepositoryInterface {
	return {
		create: async (loan) => loan,
		findById: async () => createLoan(),
		findByUserId: async () => [],
		update: async (loan) =>
			new Loan(
				loan.id,
				loan.bookId,
				loan.userId,
				loan.loanDate,
				loan.returnDate,
				loan.createdAt,
				PERSISTED_UPDATED_AT,
			),
	};
}

function createBookRepository(): BookRepositoryInterface {
	return {
		create: async (book) => book,
		findById: async () => new Book("book-1", "Clean Architecture", false),
		update: async (book) => book,
	};
}

describe("ReturnBookUseCase", () => {
	it("永続化層が採番した更新日時を返す", async () => {
		const useCase = new ReturnBookUseCase(
			createLoanRepository(),
			createBookRepository(),
			transactionManager,
		);

		const result = await useCase.execute({ id: "loan-1" });

		expect(result.updatedAt).toEqual(PERSISTED_UPDATED_AT);
	});

	it("返却日を設定して返す", async () => {
		const useCase = new ReturnBookUseCase(
			createLoanRepository(),
			createBookRepository(),
			transactionManager,
		);

		const result = await useCase.execute({ id: "loan-1" });

		expect(result.id).toBe("loan-1");
		expect(result.returnDate).not.toBeNull();
		expect(result.createdAt).toEqual(CREATED_AT);
	});
});
