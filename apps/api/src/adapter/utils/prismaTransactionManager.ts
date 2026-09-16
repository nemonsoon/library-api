import type { PrismaClient } from "@prisma/client/extension";
import type { TransactionManagerInterface } from "../../application/utils/transactionManagerInterface.js";
import type { TransactionContextInterface } from "../../domain/utils/transactionContextInterface.js";

export class PrismaTransactionManager implements TransactionManagerInterface {
	constructor(private readonly prisma: PrismaClient) {}

	async run<T>(
		operation: (ctx: TransactionContextInterface) => Promise<T>,
	): Promise<T> {
		return await this.prisma.$transaction(
			async (ctx: TransactionContextInterface) => await operation(ctx),
		);
	}
}
