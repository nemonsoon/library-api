import "dotenv/config";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaBookRepository } from "../src/adapter/repositories/prismaBookRepository.js";
import { PrismaLoanRepository } from "../src/adapter/repositories/prismaLoanRepository.js";
import { PrismaUserRepository } from "../src/adapter/repositories/prismaUserRepository.js";
import { UuidGenerator } from "../src/adapter/utils/uuidGenerator.js";
import { Book } from "../src/domain/entities/book.js";
import { Loan } from "../src/domain/entities/loan.js";
import { User } from "../src/domain/entities/user.js";
import { PrismaClient } from "../src/generated/prisma/client.js";

// 貸出はエンティティを通して作る。
// 返却期限は Loan が貸出日から決めるため、ここで日数を書くと規則が二重になる。

const BOOK_TITLES = [
	"Clean Architecture 達人に学ぶソフトウェアの構造と設計",
	"エリック・エヴァンスのドメイン駆動設計",
	"実践ドメイン駆動設計",
	"リファクタリング 既存のコードを安全に改善する",
	"達人プログラマー 熟達に向けたあなたの旅",
	"テスト駆動開発",
	"レガシーコード改善ガイド",
	"SQLアンチパターン",
	"Web API: The Good Parts",
	"プログラマが知るべき97のこと",
	"チームトポロジー",
	"LeanとDevOpsの科学",
];

const USER_EMAILS = [
	"hayashi@example.com",
	"nakamura@example.com",
	"okada@example.com",
	"sasaki@example.com",
];

function daysAgo(days: number): Date {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date;
}

async function main(): Promise<void> {
	const adapter = new PrismaBetterSqlite3({
		url: process.env.DATABASE_URL ?? "",
	});
	const prisma = new PrismaClient({ adapter });

	const bookRepository = new PrismaBookRepository(prisma);
	const userRepository = new PrismaUserRepository(prisma);
	const loanRepository = new PrismaLoanRepository(prisma);
	const idGenerator = new UuidGenerator();

	// 投入するたびに同じ状態から始められるよう、先に消す。
	// 貸出は書籍とユーザーを参照するため、参照する側から消す。
	await prisma.loan.deleteMany();
	await prisma.book.deleteMany();
	await prisma.user.deleteMany();

	const users = await Promise.all(
		USER_EMAILS.map((email) =>
			userRepository.create(new User(idGenerator.generate(), email)),
		),
	);

	// 登録日をずらして入れる。同じ時刻に揃うと一覧の並びが日付で決まらず、
	// 「登録日の新しい順」という見出しが並びについて嘘をつく。
	const books: Book[] = [];
	for (const [index, title] of BOOK_TITLES.entries()) {
		const registeredAt = daysAgo((BOOK_TITLES.length - index) * 5);
		books.push(
			await bookRepository.create(
				new Book(
					idGenerator.generate(),
					title,
					true,
					registeredAt,
					registeredAt,
				),
			),
		);
	}

	// 返却期限を過ぎた貸出、期限内の貸出、返却済みの貸出を1件ずつ含める。
	// 画面の状態がひと通り埋まり、何が起きているか見て分かる。
	const plans = [
		{ book: books[0], user: users[0], loanedDaysAgo: 21, returned: false },
		{ book: books[2], user: users[1], loanedDaysAgo: 9, returned: false },
		{ book: books[5], user: users[1], loanedDaysAgo: 3, returned: false },
		{ book: books[8], user: users[2], loanedDaysAgo: 1, returned: false },
		{ book: books[10], user: users[3], loanedDaysAgo: 30, returned: true },
	];

	for (const plan of plans) {
		const { book, user } = plan;
		if (!book || !user) {
			throw new Error("初期データの書籍またはユーザーが足りません。");
		}

		const loanDate = daysAgo(plan.loanedDaysAgo);
		const loan = new Loan(idGenerator.generate(), book.id, user.id, loanDate);

		if (plan.returned) {
			loan.return();
		} else {
			book.loan();
			await bookRepository.update(book);
		}

		await loanRepository.create(loan);
	}

	await prisma.$disconnect();

	console.log(
		`初期データを投入しました: 書籍 ${books.length} 件、ユーザー ${users.length} 件、貸出 ${plans.length} 件`,
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
