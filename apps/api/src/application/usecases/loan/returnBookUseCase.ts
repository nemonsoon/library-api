import type { BookRepositoryInterface } from "../../../domain/repositories/bookRepositoryInterface.js";
import type { LoanRepositoryInterface } from "../../../domain/repositories/loanRepositoryInterface.js";
import type { ReturnBookRequestDto } from "../../dtos/loan/returnBookRequestDto.js";
import type { ReturnBookResponseDto } from "../../dtos/loan/returnBookResponseDto.js";
import { BookNotFoundError } from "../../errors/bookNotFoundError.js";
import { LoanNotFoundError } from "../../errors/loanNotFoundError.js";
import type { TransactionManagerInterface } from "../../utils/transactionManagerInterface.js";
import type { ReturnBookUseCaseInterface } from "./returnBookUseCaseInterface.js";

export class ReturnBookUseCase implements ReturnBookUseCaseInterface {
	constructor(
		private readonly loanRepository: LoanRepositoryInterface,
		readonly bookRepository: BookRepositoryInterface,
		private readonly transactionManager: TransactionManagerInterface,
	) {}

	async execute(
		requestDto: ReturnBookRequestDto,
	): Promise<ReturnBookResponseDto> {
		return await this.transactionManager.run(async (ctx) => {
			const loan = await this.loanRepository.findById(requestDto.id, ctx);
			if (!loan) {
				throw new LoanNotFoundError();
			}
			const book = await this.bookRepository.findById(loan.bookId, ctx);

			if (!book) {
				throw new BookNotFoundError();
			}
			book.return();

			await this.bookRepository.update(book, ctx);

			loan.return();
			const updatedLoan = await this.loanRepository.update(loan, ctx);

			// 返却直後の貸出には必ず返却日が入る。型を Date に保つために取り出して確かめる
			const { returnDate } = updatedLoan;
			if (!returnDate) {
				throw new Error("返却日が保存されていません。");
			}

			return {
				id: updatedLoan.id,
				returnDate,
				createdAt: updatedLoan.createdAt,
				updatedAt: updatedLoan.updatedAt,
			};
		});
	}
}
