import type { FindBookByIdRequestDto } from "../../dtos/book/findBookByIdRequestDto.js";
import type { FindBookByIdResponseDto } from "../../dtos/book/findBookByIdResponseDto.js";

export interface FindBookByIdUseCaseInterface {
	execute(
		requestDto: FindBookByIdRequestDto,
	): Promise<FindBookByIdResponseDto | null>;
}
