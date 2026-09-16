import type { ListUsersResponseDto } from "../../dtos/user/listUsersResponseDto.js";

export interface ListUsersUseCaseInterface {
	execute(): Promise<ListUsersResponseDto>;
}
