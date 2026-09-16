import { User } from "../../../domain/entities/user.js";
import type { UserRepositoryInterface } from "../../../domain/repositories/userRepositoryInterface.js";
import type { IdGeneratorInterface } from "../../../domain/utils/idGeneratorInterface.js";
import type { CreateUserRequestDto } from "../../dtos/user/createUserRequestDto.js";
import type { CreateUserResponseDto } from "../../dtos/user/createUserResponseDto.js";
import type { CreateUserUseCaseInterface } from "./createUserUseCaseInterface.js";

export class CreateUserUseCase implements CreateUserUseCaseInterface {
	constructor(
		private readonly userRepository: UserRepositoryInterface,
		private readonly idGenerator: IdGeneratorInterface,
	) {}

	async execute(
		requestDto: CreateUserRequestDto,
	): Promise<CreateUserResponseDto> {
		const id = this.idGenerator.generate();
		const newUser = new User(id, requestDto.email);
		const createdUser = await this.userRepository.create(newUser);

		return {
			id: createdUser.id,
			email: createdUser.email,
			createdAt: createdUser.createdAt,
			updatedAt: createdUser.updatedAt,
		};
	}
}
