import { Book } from "../../domain/entities/book.js";
import type { BookRepositoryInterface } from "../../domain/repositories/bookRepositoryInterface.js";
import type { TransactionContextInterface } from "../../domain/utils/transactionContextInterface.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

export class PrismaBookRepository implements BookRepositoryInterface {
	constructor(private readonly prisma: PrismaClient) {}

	// 書籍を作成する
	async create(book: Book, ctx?: TransactionContextInterface): Promise<Book> {
		const prisma = ctx ? (ctx as PrismaClient) : this.prisma;
		const createdBook = await prisma.book.create({
			data: {
				id: book.id,
				title: book.title,
				isAvailable: book.isAvailable,
				createdAt: book.createdAt,
				updatedAt: book.updatedAt,
			},
		});

		return new Book(
			createdBook.id,
			createdBook.title,
			createdBook.isAvailable,
			createdBook.createdAt,
			createdBook.updatedAt,
		);
	}

	// 書籍をIDで取得する
	async findById(
		id: string,
		ctx?: TransactionContextInterface,
	): Promise<Book | null> {
		const prisma = ctx ? (ctx as PrismaClient) : this.prisma;
		const foundBook = await prisma.book.findUnique({
			where: { id },
		});

		if (!foundBook) {
			return null;
		}

		return new Book(
			foundBook.id,
			foundBook.title,
			foundBook.isAvailable,
			foundBook.createdAt,
			foundBook.updatedAt,
		);
	}

	async update(book: Book, ctx?: TransactionContextInterface): Promise<Book> {
		const prisma = ctx ? (ctx as PrismaClient) : this.prisma;
		const updatedBook = await prisma.book.update({
			where: { id: book.id },
			data: {
				isAvailable: book.isAvailable,
			},
		});

		return new Book(
			updatedBook.id,
			updatedBook.title,
			updatedBook.isAvailable,
			updatedBook.createdAt,
			updatedBook.updatedAt,
		);
	}
}
