import type { Request, Response } from "express";
import type { CreateUserRequestDto } from "../../application/dtos/user/createUserRequestDto.js";
import type { CreateUserUseCaseInterface } from "../../application/usecases/user/createUserUseCaseInterface.js";
import type { ListUsersUseCaseInterface } from "../../application/usecases/user/listUsersUseCaseInterface.js";
import { parseRequestBody } from "../validation/parseRequestBody.js";
import { createUserBodySchema } from "../validation/requestSchemas.js";
import { sendErrorResponse } from "./errorResponse.js";

export class UserController {
	constructor(
		private readonly createUserUseCase: CreateUserUseCaseInterface,
		private readonly listUsersUseCase: ListUsersUseCaseInterface,
	) {}

	async create(req: Request, res: Response): Promise<void> {
		try {
			const requestDto: CreateUserRequestDto = parseRequestBody(
				createUserBodySchema,
				req.body,
			);
			const user = await this.createUserUseCase.execute(requestDto);
			res.status(201).json(user);
		} catch (error) {
			sendErrorResponse(res, error, "ユーザーの作成に失敗しました");
		}
	}

	async list(_req: Request, res: Response): Promise<void> {
		try {
			const users = await this.listUsersUseCase.execute();
			res.status(200).json(users);
		} catch (error) {
			sendErrorResponse(res, error, "ユーザーの取得に失敗しました");
		}
	}
}
