import type { Request, Response } from "express";
import type { AddBookRequestDto } from "../../application/dtos/book/addBookRequestDto.js";
import type { FindBookByIdRequestDto } from "../../application/dtos/book/findBookByIdRequestDto.js";
import type { AddBookUseCaseInterface } from "../../application/usecases/book/addBookUseCaseInterface.js";
import type { FindBookByIdUseCaseInterface } from "../../application/usecases/book/findBookByIdUseCaseInterface.js";

export class BookController {
	constructor(
		private readonly addBookUseCase: AddBookUseCaseInterface,
		private readonly findBookByIdUseCase: FindBookByIdUseCaseInterface,
	) {}

	async add(req: Request, res: Response): Promise<void> {
		try {
			const requestDto: AddBookRequestDto = {
				title: req.body.title,
			};
			const book = await this.addBookUseCase.execute(requestDto);
			res.status(201).json(book);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "書籍の登録に失敗しました" });
		}
	}

	async findById(req: Request, res: Response): Promise<void> {
		try {
			const requestDto: FindBookByIdRequestDto = {
				id: req.params.id as string,
			};
			const book = await this.findBookByIdUseCase.execute(requestDto);
			if (book) {
				res.status(200).json(book);
			} else {
				res.status(404).json({ error: "書籍が見つかりませんでした" });
			}
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "書籍の検索に失敗しました" });
		}
	}
}
