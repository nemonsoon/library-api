import type { Book } from "../entities/book.js";
import type { TransactionContextInterface } from "../utils/transactionContextInterface.js";

export interface BookRepositoryInterface {
	create(book: Book, ctx?: TransactionContextInterface): Promise<Book>;
	findById(id: string, ctx?: TransactionContextInterface): Promise<Book | null>;
	update(book: Book, ctx?: TransactionContextInterface): Promise<Book>;
}
