import type { TransactionContextInterface } from "../../domain/utils/transactionContextInterface.js";

export interface TransactionManagerInterface {
	run<T>(
		operation: (ctx: TransactionContextInterface) => Promise<T>,
	): Promise<T>;
}
