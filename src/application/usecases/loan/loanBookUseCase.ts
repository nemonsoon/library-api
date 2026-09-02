import { Loan } from "../../../domain/entities/loan.js";
import type { BookRepositoryInterface } from "../../../domain/repositories/bookRepositoryInterface.js";
import type { LoanRepositoryInterface } from "../../../domain/repositories/loanRepositoryInterface.js";
import type { IdGeneratorInterface } from "../../../domain/utils/idGeneratorInterface.js";
import type { LoanBookRequestDto } from "../../dtos/loan/loanBookRequestDto.js";
import type { LoanBookResponseDto } from "../../dtos/loan/loanBookResponseDto.js";
import type { TransactionManagerInterface } from "../../utils/transactionManagerInterface.js";
import type { LoanBookUseCaseInterface } from "./loanBookUseCaseInterface.js";

export class LoanBookUseCase implements LoanBookUseCaseInterface {
	constructor(
		private readonly loanRepository: LoanRepositoryInterface,
		private readonly bookRepository: BookRepositoryInterface,
		private readonly idGenerator: IdGeneratorInterface,
		private readonly transactionManager: TransactionManagerInterface,
	) {}

	async execute(requestDto: LoanBookRequestDto): Promise<LoanBookResponseDto> {
		return await this.transactionManager.run(async (ctx) => {
			// 1. 書籍を取得
			const book = await this.bookRepository.findById(requestDto.bookId, ctx);
			if (!book) {
				throw new Error("書籍が存在しません。");
			}

			// 2. 貸出処理
			book.loan();

			// 3. ユーザーの貸出上限をチェック
			const loans = await this.loanRepository.findByUserId(
				requestDto.userId,
				ctx,
			);
			if (loans.filter((loan) => loan.returnDate === null).length >= 5) {
				throw new Error("既に上限まで貸し出されています。");
			}

			// 4. 書籍を更新
			await this.bookRepository.update(book, ctx);

			// 5. 貸出履歴を作成
			const newLoan = new Loan(
				this.idGenerator.generate(),
				requestDto.bookId,
				requestDto.userId,
				new Date(),
			);

			// 6. 貸出履歴を永続化
			const createdLoan = await this.loanRepository.create(newLoan, ctx);

			// 7. レスポンスDTOを返す
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
