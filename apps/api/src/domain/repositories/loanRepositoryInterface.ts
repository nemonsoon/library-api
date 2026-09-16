import type { Loan } from "../entities/loan.js";
import type { TransactionContextInterface } from "../utils/transactionContextInterface.js";

export interface LoanRepositoryInterface {
	create(loan: Loan, ctx?: TransactionContextInterface): Promise<Loan>;
	findById(id: string, ctx?: TransactionContextInterface): Promise<Loan | null>;
	findByUserId(
		userId: string,
		ctx?: TransactionContextInterface,
	): Promise<Loan[]>;
	update(loan: Loan, ctx?: TransactionContextInterface): Promise<Loan>;
}
