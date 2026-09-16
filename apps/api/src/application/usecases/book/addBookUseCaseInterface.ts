import type { AddBookRequestDto } from "../../dtos/book/addBookRequestDto.js";
import type { AddBookResponseDto } from "../../dtos/book/addBookResponseDto.js";

export interface AddBookUseCaseInterface {
	execute(requestDto: AddBookRequestDto): Promise<AddBookResponseDto>;
}
