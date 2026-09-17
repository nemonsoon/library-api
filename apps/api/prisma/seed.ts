import "dotenv/config";
import { faker } from "@faker-js/faker";
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

// 生成する値を毎回同じにする。画面の見え方を比べるとき、初期データが動くと差が読めない。
faker.seed(20260917);

const BOOK_TITLES = [
	"吾輩は猫である",
	"こころ",
	"坊っちゃん",
	"人間失格",
	"斜陽",
	"羅生門",
	"銀河鉄道の夜",
	"雪国",
	"金閣寺",
	"砂の女",
	"山月記",
	"檸檬",
	"ノルウェイの森",
	"海辺のカフカ",
	"星の王子さま",
	"老人と海",
	"変身",
	"罪と罰",
	"百年の孤独",
	"アルジャーノンに花束を",
	"思考の整理学",
	"理科系の作文技術",
	"知的生産の技術",
	"夜と霧",
	"銃・病原菌・鉄",
	"サピエンス全史",
	"ファクトフルネス",
	"君たちはどう生きるか",
	"日本語練習帳",
	"失敗の本質",
	"リーダブルコード",
	"Clean Architecture 達人に学ぶソフトウェアの構造と設計",
	"エリック・エヴァンスのドメイン駆動設計",
	"実践ドメイン駆動設計",
	"リファクタリング 既存のコードを安全に改善する",
	"達人プログラマー 熟達に向けたあなたの旅",
	"テスト駆動開発",
	"SQLアンチパターン",
	"Web API: The Good Parts",
	"チームトポロジー",
];

// User は名前を持たず、画面に借り主として出るのはメールアドレスである。
// 読んで誰か分かる形にしたいので、姓名をローマ字で組み立てる。
const FAMILY_NAMES = [
	"hayashi",
	"nakamura",
	"okada",
	"sasaki",
	"kobayashi",
	"takahashi",
	"watanabe",
	"ito",
	"yamamoto",
	"saito",
	"matsuda",
	"fujii",
];

const GIVEN_NAMES = [
	"yui",
	"kenji",
	"sana",
	"takumi",
	"mio",
	"haruto",
	"akane",
	"ryo",
	"nao",
	"chika",
];

const USER_COUNT = 10;

// 返却期限は貸出日の14日後なので、貸出からの経過日数がそのまま期限までの距離になる。
// 「返却予定」が超過・間近・余裕の3通りを同時に見せられるよう、経過日数の幅を分けて指定する。
const ACTIVE_LOAN_BUCKETS = [
	{ count: 3, minDaysAgo: 15, maxDaysAgo: 24 }, // 返却期限を過ぎている
	{ count: 3, minDaysAgo: 9, maxDaysAgo: 14 }, // 返却期限が近い
	{ count: 4, minDaysAgo: 1, maxDaysAgo: 8 }, // まだ余裕がある
];

const RETURNED_LOAN_COUNT = 3;

function daysAgo(days: number): Date {
	const date = new Date();
	date.setDate(date.getDate() - days);
	return date;
}

function buildEmails(count: number): string[] {
	const emails = new Set<string>();
	while (emails.size < count) {
		const family = faker.helpers.arrayElement(FAMILY_NAMES);
		const given = faker.helpers.arrayElement(GIVEN_NAMES);
		emails.add(`${given}.${family}@example.com`);
	}
	return [...emails];
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
	// 貸出は本とユーザーを参照するため、参照する側から消す。
	await prisma.loan.deleteMany();
	await prisma.book.deleteMany();
	await prisma.user.deleteMany();

	const users = await Promise.all(
		buildEmails(USER_COUNT).map((email) =>
			userRepository.create(new User(idGenerator.generate(), email)),
		),
	);

	// 登録日をずらして入れる。同じ時刻に揃うと一覧の並びが日付で決まらず、
	// 「登録日の新しい順」という見出しが並びについて嘘をつく。
	const books: Book[] = [];
	for (const [index, title] of BOOK_TITLES.entries()) {
		const registeredAt = daysAgo(
			(BOOK_TITLES.length - index) * 5 + faker.number.int({ min: 0, max: 4 }),
		);
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

	// どの本が誰に貸し出されているかは散らす。
	// 並び順のまま貸し出すと、一覧の先頭だけが貸出中に固まって全体の見え方が偏る。
	const borrowedBooks = faker.helpers.arrayElements(
		books,
		ACTIVE_LOAN_BUCKETS.reduce((sum, bucket) => sum + bucket.count, 0) +
			RETURNED_LOAN_COUNT,
	);

	let cursor = 0;
	for (const bucket of ACTIVE_LOAN_BUCKETS) {
		for (let index = 0; index < bucket.count; index++) {
			const book = borrowedBooks[cursor++];
			if (!book) {
				throw new Error("貸し出す本が足りません。");
			}

			const user = faker.helpers.arrayElement(users);
			const loanDate = daysAgo(
				faker.number.int({
					min: bucket.minDaysAgo,
					max: bucket.maxDaysAgo,
				}),
			);

			book.loan();
			await bookRepository.update(book);
			await loanRepository.create(
				new Loan(idGenerator.generate(), book.id, user.id, loanDate),
			);
		}
	}

	// 返却済みの貸出も入れる。貸出の履歴が残ることと、返した本がまた貸し出せることを示す。
	for (let index = 0; index < RETURNED_LOAN_COUNT; index++) {
		const book = borrowedBooks[cursor++];
		if (!book) {
			throw new Error("貸し出す本が足りません。");
		}

		const user = faker.helpers.arrayElement(users);
		const loan = new Loan(
			idGenerator.generate(),
			book.id,
			user.id,
			daysAgo(faker.number.int({ min: 30, max: 90 })),
		);
		loan.return();
		await loanRepository.create(loan);
	}

	await prisma.$disconnect();

	const loanCount =
		ACTIVE_LOAN_BUCKETS.reduce((sum, bucket) => sum + bucket.count, 0) +
		RETURNED_LOAN_COUNT;
	console.log(
		`初期データを投入しました: 本 ${books.length} 件、ユーザー ${users.length} 件、貸出 ${loanCount} 件`,
	);
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
