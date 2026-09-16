import type { UserRepositoryInterface } from "../../../domain/repositories/userRepositoryInterface.js";
import type { ListUsersResponseDto } from "../../dtos/user/listUsersResponseDto.js";
import type { ListUsersUseCaseInterface } from "./listUsersUseCaseInterface.js";

export class ListUsersUseCase implements ListUsersUseCaseInterface {
	constructor(private readonly userRepository: UserRepositoryInterface) {}

	async execute(): Promise<ListUsersResponseDto> {
		const users = await this.userRepository.findAll();

		return users.map((user) => ({
			id: user.id,
			email: user.email,
			createdAt: user.createdAt,
			updatedAt: user.updatedAt,
		}));
	}
}
