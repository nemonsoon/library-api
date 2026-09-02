import type { Request, Response } from "express";
import type { LoanBookRequestDto } from "../../application/dtos/loan/loanBookRequestDto.js";
import type { ReturnBookRequestDto } from "../../application/dtos/loan/returnBookRequestDto.js";
import type { LoanBookUseCaseInterface } from "../../application/usecases/loan/loanBookUseCaseInterface.js";
import type { ReturnBookUseCaseInterface } from "../../application/usecases/loan/returnBookUseCaseInterface.js";
export class LoanController {
	constructor(
		private readonly loanBookUseCase: LoanBookUseCaseInterface,
		private readonly returnBookUseCase: ReturnBookUseCaseInterface,
	) {}

	async loanBook(req: Request, res: Response): Promise<void> {
		try {
			const requestDto: LoanBookRequestDto = {
				bookId: req.body.bookId,
				userId: req.body.userId,
			};
			const loan = await this.loanBookUseCase.execute(requestDto);
			res.status(201).json(loan);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "書籍の貸出に失敗しました" });
		}
	}

	async returnBook(req: Request, res: Response): Promise<void> {
		try {
			const requestDto: ReturnBookRequestDto = {
				id: req.body.id,
			};
			const loan = await this.returnBookUseCase.execute(requestDto);
			res.status(200).json(loan);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "書籍の返却に失敗しました" });
		}
	}
}
