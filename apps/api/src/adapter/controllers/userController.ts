import type { Request, Response } from "express";
import type { CreateUserRequestDto } from "../../application/dtos/user/createUserRequestDto.js";
import type { CreateUserUseCaseInterface } from "../../application/usecases/user/createUserUseCaseInterface.js";

export class UserController {
	constructor(private readonly createUserUseCase: CreateUserUseCaseInterface) {}

	async create(req: Request, res: Response): Promise<void> {
		try {
			const requestDto: CreateUserRequestDto = {
				email: req.body.email,
			};
			const user = await this.createUserUseCase.execute(requestDto);
			res.status(201).json(user);
		} catch (error) {
			console.log(error);
			res.status(500).json({ error: "ユーザーの作成に失敗しました" });
		}
	}
}
