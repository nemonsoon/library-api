import type { CreateUserRequestDto } from "../../dtos/user/createUserRequestDto.js";
import type { CreateUserResponseDto } from "../../dtos/user/createUserResponseDto.js";

export interface CreateUserUseCaseInterface {
	execute(requestDto: CreateUserRequestDto): Promise<CreateUserResponseDto>;
}
