import { describe, expect, it } from "vitest";
import { Book } from "../src/domain/entities/book.js";
import { BookAlreadyLoanedError } from "../src/domain/errors/bookAlreadyLoanedError.js";
import { BookNotLoanedError } from "../src/domain/errors/bookNotLoanedError.js";

describe("Book", () => {
	it("貸し出すと貸出中になる", () => {
		const book = new Book("book-1", "Clean Architecture");

		book.loan();

		expect(book.isAvailable).toBe(false);
	});

	it("貸出中の書籍は再度貸し出せない", () => {
		const book = new Book("book-1", "Clean Architecture", false);

		expect(() => book.loan()).toThrow(BookAlreadyLoanedError);
	});

	it("貸し出されていない書籍は返却できない", () => {
		const book = new Book("book-1", "Clean Architecture", true);

		expect(() => book.return()).toThrow(BookNotLoanedError);
	});
});
