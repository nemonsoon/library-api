import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { BookController } from "../src/adapter/controllers/bookController.js";
import { LoanController } from "../src/adapter/controllers/loanController.js";
import { UserController } from "../src/adapter/controllers/userController.js";

// 検証で弾くことだけを確かめるので、ユースケースは呼ばれたら失敗させる
function shouldNotRun(): never {
	throw new Error("検証を通過してユースケースが呼ばれた");
}

const bookController = new BookController(
	{ execute: shouldNotRun },
	{ execute: shouldNotRun },
	{ execute: shouldNotRun },
);
const userController = new UserController(
	{ execute: shouldNotRun },
	{ execute: shouldNotRun },
);
const loanController = new LoanController(
	{ execute: shouldNotRun },
	{ execute: shouldNotRun },
);

type ResponseSpy = {
	statusCode: number | undefined;
	body: unknown;
	res: Response;
};

function createResponseSpy(): ResponseSpy {
	const spy: ResponseSpy = {
		statusCode: undefined,
		body: undefined,
		res: undefined as unknown as Response,
	};
	spy.res = {
		status(code: number) {
			spy.statusCode = code;
			return spy.res;
		},
		json(payload: unknown) {
			spy.body = payload;
			return spy.res;
		},
	} as unknown as Response;
	return spy;
}

function createRequest(body: unknown): Request {
	return { body } as unknown as Request;
}

describe("リクエストの入力検証", () => {
	it("タイトルが欠けた書籍の登録は 400 を返す", async () => {
		const spy = createResponseSpy();

		await bookController.add(createRequest({}), spy.res);

		expect(spy.statusCode).toBe(400);
	});

	it("タイトルが空文字の書籍の登録は 400 を返す", async () => {
		const spy = createResponseSpy();

		await bookController.add(createRequest({ title: "" }), spy.res);

		expect(spy.statusCode).toBe(400);
	});

	it("タイトルが文字列でない書籍の登録は 400 を返す", async () => {
		const spy = createResponseSpy();

		await bookController.add(createRequest({ title: 42 }), spy.res);

		expect(spy.statusCode).toBe(400);
	});

	it("形式が不正なメールアドレスのユーザー作成は 400 を返す", async () => {
		const spy = createResponseSpy();

		await userController.create(createRequest({ email: "reader" }), spy.res);

		expect(spy.statusCode).toBe(400);
	});

	it("識別子が欠けた貸出は 400 を返す", async () => {
		const spy = createResponseSpy();

		await loanController.loanBook(
			createRequest({ bookId: "018f8b3c-0000-7000-8000-000000000001" }),
			spy.res,
		);

		expect(spy.statusCode).toBe(400);
	});

	it("識別子の形式が不正な返却は 400 を返す", async () => {
		const spy = createResponseSpy();

		await loanController.returnBook(createRequest({ id: "loan-1" }), spy.res);

		expect(spy.statusCode).toBe(400);
	});

	it("検証の失敗も既存の誤り応答と同じ形式で返る", async () => {
		const spy = createResponseSpy();

		await bookController.add(createRequest({}), spy.res);

		expect(spy.body).toEqual({ error: expect.any(String) });
	});
});
