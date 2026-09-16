import type { Request, Response } from "express";
import { describe, expect, it } from "vitest";
import { BookController } from "../src/adapter/controllers/bookController.js";
import type { AddBookResponseDto } from "../src/application/dtos/book/addBookResponseDto.js";
import type { AddBookUseCaseInterface } from "../src/application/usecases/book/addBookUseCaseInterface.js";
import type { FindBookByIdUseCaseInterface } from "../src/application/usecases/book/findBookByIdUseCaseInterface.js";

const CREATED_AT = new Date("2026-01-01T00:00:00.000Z");

const createdBook: AddBookResponseDto = {
	id: "book-1",
	title: "Clean Architecture",
	isAvailable: true,
	createdAt: CREATED_AT,
	updatedAt: CREATED_AT,
};

// 登録は永続化を待ってから作成済みの書籍を返すため、受理ではなく作成として応答する
const addBookUseCase: AddBookUseCaseInterface = {
	execute: async () => createdBook,
};

const findBookByIdUseCase: FindBookByIdUseCaseInterface = {
	execute: async () => null,
};

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

function createRequest(body: Record<string, unknown>): Request {
	return { body } as unknown as Request;
}

describe("BookController", () => {
	it("書籍の登録は 201 と作成した書籍を返す", async () => {
		const controller = new BookController(addBookUseCase, findBookByIdUseCase);
		const spy = createResponseSpy();

		await controller.add(
			createRequest({ title: "Clean Architecture" }),
			spy.res,
		);

		expect(spy.statusCode).toBe(201);
		expect(spy.body).toBe(createdBook);
	});

	it("存在しない書籍の取得は 404 を返す", async () => {
		const controller = new BookController(addBookUseCase, findBookByIdUseCase);
		const spy = createResponseSpy();

		await controller.findById(
			{ params: { id: "missing" } } as unknown as Request,
			spy.res,
		);

		expect(spy.statusCode).toBe(404);
	});
});
