import { describe, expect, it } from "vitest";
import { Loan } from "../src/domain/entities/loan.js";
import { LoanAlreadyReturnedError } from "../src/domain/errors/loanAlreadyReturnedError.js";

const LOAN_DATE = new Date("2026-01-01T00:00:00.000Z");

function createLoan(returnDate: Date | null = null): Loan {
	return new Loan("loan-1", "book-1", "user-1", LOAN_DATE, returnDate);
}

describe("Loan", () => {
	it("返却期限は貸出日の14日後になる", () => {
		expect(createLoan().dueDate).toEqual(new Date("2026-01-15T00:00:00.000Z"));
	});

	it("返却すると返却日が入る", () => {
		const loan = createLoan();

		loan.return();

		expect(loan.returnDate).not.toBeNull();
	});

	it("返却済みの貸出は再度返却できない", () => {
		const loan = createLoan(new Date("2026-01-10T00:00:00.000Z"));

		expect(() => loan.return()).toThrow(LoanAlreadyReturnedError);
	});
});
