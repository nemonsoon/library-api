import type { Loan } from "../../../domain/entities/loan.js";
import type { BookRepositoryInterface } from "../../../domain/repositories/bookRepositoryInterface.js";
import type { LoanRepositoryInterface } from "../../../domain/repositories/loanRepositoryInterface.js";
import type { UserRepositoryInterface } from "../../../domain/repositories/userRepositoryInterface.js";
import type {
	CurrentLoanDto,
	ListBooksResponseDto,
} from "../../dtos/book/listBooksResponseDto.js";
import type { ListBooksUseCaseInterface } from "./listBooksUseCaseInterface.js";

export class ListBooksUseCase implements ListBooksUseCaseInterface {
	constructor(
		private readonly bookRepository: BookRepositoryInterface,
		private readonly loanRepository: LoanRepositoryInterface,
		private readonly userRepository: UserRepositoryInterface,
	) {}

	async execute(): Promise<ListBooksResponseDto> {
		const books = await this.bookRepository.findAll();
		if (books.length === 0) {
			return [];
		}

		const activeLoans = await this.loanRepository.findActiveByBookIds(
			books.map((book) => book.id),
		);
		const loanByBookId = this.pickLatestLoanPerBook(activeLoans);

		const borrowerIds = [
			...new Set([...loanByBookId.values()].map((loan) => loan.userId)),
		];
		const borrowers = await this.userRepository.findByIds(borrowerIds);
		const emailByUserId = new Map(
			borrowers.map((borrower) => [borrower.id, borrower.email]),
		);

		return books.map((book) => ({
			id: book.id,
			title: book.title,
			isAvailable: book.isAvailable,
			currentLoan: this.toCurrentLoanDto(
				loanByBookId.get(book.id),
				emailByUserId,
			),
			createdAt: book.createdAt,
			updatedAt: book.updatedAt,
		}));
	}

	// 「1冊につき未返却の貸出は1件」という制約はデータベースに無いため、
	// 複数あった場合は貸出日が最も新しいものを現在の貸出として扱う。
	// 取得時点で貸出日の新しい順に並んでいるので、先に現れたものを採る。
	private pickLatestLoanPerBook(loans: Loan[]): Map<string, Loan> {
		const latest = new Map<string, Loan>();
		for (const loan of loans) {
			if (!latest.has(loan.bookId)) {
				latest.set(loan.bookId, loan);
			}
		}
		return latest;
	}

	private toCurrentLoanDto(
		loan: Loan | undefined,
		emailByUserId: Map<string, string>,
	): CurrentLoanDto | null {
		if (!loan) {
			return null;
		}

		// 貸出はユーザーへの外部キーを持つため、ここで見つからないのは保存された
		// データが壊れている場合に限る。空の値で取り繕わず、失敗として扱う。
		const userEmail = emailByUserId.get(loan.userId);
		if (userEmail === undefined) {
			throw new Error(`貸出 ${loan.id} のユーザーが見つかりません。`);
		}

		return {
			id: loan.id,
			userId: loan.userId,
			userEmail,
			loanDate: loan.loanDate,
			dueDate: loan.dueDate,
		};
	}
}
