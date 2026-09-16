import type { TransactionManagerInterface } from "../../src/application/utils/transactionManagerInterface.js";
import { Book } from "../../src/domain/entities/book.js";
import { Loan } from "../../src/domain/entities/loan.js";
import type { User } from "../../src/domain/entities/user.js";
import type { BookRepositoryInterface } from "../../src/domain/repositories/bookRepositoryInterface.js";
import type { LoanRepositoryInterface } from "../../src/domain/repositories/loanRepositoryInterface.js";
import type { UserRepositoryInterface } from "../../src/domain/repositories/userRepositoryInterface.js";
import type { IdGeneratorInterface } from "../../src/domain/utils/idGeneratorInterface.js";

// エンティティは操作で自分の状態を変えるため、保存された値をそのまま返すと
// update を呼び忘れても素通りしてしまう。取り出すたびに複製して、
// 永続化層と同じく「書き戻さなければ残らない」振る舞いにする。

export class InMemoryBookRepository implements BookRepositoryInterface {
	private readonly books = new Map<string, Book>();

	constructor(books: Book[] = []) {
		for (const book of books) {
			this.books.set(book.id, book);
		}
	}

	async create(book: Book): Promise<Book> {
		this.books.set(book.id, book);
		return this.copy(book);
	}

	async findById(id: string): Promise<Book | null> {
		const found = this.books.get(id);
		return found ? this.copy(found) : null;
	}

	async findAll(): Promise<Book[]> {
		return [...this.books.values()].map((book) => this.copy(book));
	}

	async update(book: Book): Promise<Book> {
		this.books.set(book.id, book);
		return this.copy(book);
	}

	private copy(book: Book): Book {
		return new Book(
			book.id,
			book.title,
			book.isAvailable,
			book.createdAt,
			book.updatedAt,
		);
	}
}

export class InMemoryUserRepository implements UserRepositoryInterface {
	private readonly users = new Map<string, User>();

	constructor(users: User[] = []) {
		for (const user of users) {
			this.users.set(user.id, user);
		}
	}

	async create(user: User): Promise<User> {
		this.users.set(user.id, user);
		return user;
	}

	async findById(id: string): Promise<User | null> {
		return this.users.get(id) ?? null;
	}

	async findByIds(ids: string[]): Promise<User[]> {
		return ids
			.map((id) => this.users.get(id))
			.filter((user): user is User => user !== undefined);
	}

	async findAll(): Promise<User[]> {
		return [...this.users.values()];
	}
}

export class InMemoryLoanRepository implements LoanRepositoryInterface {
	private readonly loans = new Map<string, Loan>();

	constructor(loans: Loan[] = []) {
		for (const loan of loans) {
			this.loans.set(loan.id, loan);
		}
	}

	async create(loan: Loan): Promise<Loan> {
		this.loans.set(loan.id, loan);
		return this.copy(loan);
	}

	async findById(id: string): Promise<Loan | null> {
		const found = this.loans.get(id);
		return found ? this.copy(found) : null;
	}

	async findByUserId(userId: string): Promise<Loan[]> {
		return [...this.loans.values()]
			.filter((loan) => loan.userId === userId)
			.map((loan) => this.copy(loan));
	}

	async findActiveByBookIds(bookIds: string[]): Promise<Loan[]> {
		return [...this.loans.values()]
			.filter(
				(loan) => bookIds.includes(loan.bookId) && loan.returnDate === null,
			)
			.sort((a, b) => b.loanDate.getTime() - a.loanDate.getTime())
			.map((loan) => this.copy(loan));
	}

	async update(loan: Loan): Promise<Loan> {
		this.loans.set(loan.id, loan);
		return this.copy(loan);
	}

	private copy(loan: Loan): Loan {
		return new Loan(
			loan.id,
			loan.bookId,
			loan.userId,
			loan.loanDate,
			loan.returnDate,
			loan.createdAt,
			loan.updatedAt,
		);
	}
}

// トランザクション境界の検証は対象外なので、そのまま実行するだけで足りる
export const immediateTransactionManager: TransactionManagerInterface = {
	run: async (operation) => operation({}),
};

export class SequentialIdGenerator implements IdGeneratorInterface {
	private count = 0;

	generate(): string {
		this.count += 1;
		return `generated-${this.count}`;
	}
}
