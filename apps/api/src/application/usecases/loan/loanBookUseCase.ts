import { Loan } from "../../../domain/entities/loan.js";
import { LoanLimitExceededError } from "../../../domain/errors/loanLimitExceededError.js";
import type { BookRepositoryInterface } from "../../../domain/repositories/bookRepositoryInterface.js";
import type { LoanRepositoryInterface } from "../../../domain/repositories/loanRepositoryInterface.js";
import type { UserRepositoryInterface } from "../../../domain/repositories/userRepositoryInterface.js";
import type { IdGeneratorInterface } from "../../../domain/utils/idGeneratorInterface.js";
import type { LoanBookRequestDto } from "../../dtos/loan/loanBookRequestDto.js";
import type { LoanBookResponseDto } from "../../dtos/loan/loanBookResponseDto.js";
import { BookNotFoundError } from "../../errors/bookNotFoundError.js";
import { UserNotFoundError } from "../../errors/userNotFoundError.js";
import type { TransactionManagerInterface } from "../../utils/transactionManagerInterface.js";
import type { LoanBookUseCaseInterface } from "./loanBookUseCaseInterface.js";

// 1人が同時に借りられる冊数。
// 判定にはユーザーの貸出をすべて数える必要があり、1つの書籍だけでは決まらないため、
// 規則そのものは Book ではなくこのユースケースが持つ。
const CONCURRENT_LOAN_LIMIT = 5;

export class LoanBookUseCase implements LoanBookUseCaseInterface {
	constructor(
		private readonly loanRepository: LoanRepositoryInterface,
		private readonly bookRepository: BookRepositoryInterface,
		private readonly userRepository: UserRepositoryInterface,
		private readonly idGenerator: IdGeneratorInterface,
		private readonly transactionManager: TransactionManagerInterface,
	) {}

	async execute(requestDto: LoanBookRequestDto): Promise<LoanBookResponseDto> {
		return await this.transactionManager.run(async (ctx) => {
			// 1. 操作の前提となる書籍とユーザーを確かめる
			const book = await this.bookRepository.findById(requestDto.bookId, ctx);
			if (!book) {
				throw new BookNotFoundError();
			}

			const user = await this.userRepository.findById(requestDto.userId, ctx);
			if (!user) {
				throw new UserNotFoundError();
			}

			// 2. 貸出中でないことを書籍自身に確かめさせる
			book.loan();

			// 3. ユーザーの同時貸出が上限に達していないかを確かめる
			const loans = await this.loanRepository.findByUserId(
				requestDto.userId,
				ctx,
			);
			const activeLoanCount = loans.filter(
				(loan) => loan.returnDate === null,
			).length;
			if (activeLoanCount >= CONCURRENT_LOAN_LIMIT) {
				throw new LoanLimitExceededError(CONCURRENT_LOAN_LIMIT);
			}

			// 4. 書籍を更新する
			await this.bookRepository.update(book, ctx);

			// 5. 貸出を作成して永続化する
			const newLoan = new Loan(
				this.idGenerator.generate(),
				requestDto.bookId,
				requestDto.userId,
				new Date(),
			);
			const createdLoan = await this.loanRepository.create(newLoan, ctx);

			return {
				id: createdLoan.id,
				bookId: createdLoan.bookId,
				userId: createdLoan.userId,
				loanDate: createdLoan.loanDate,
				dueDate: createdLoan.dueDate,
				createdAt: createdLoan.createdAt,
				updatedAt: createdLoan.updatedAt,
			};
		});
	}
}
