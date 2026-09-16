import type { ReturnBookRequestDto } from "../../dtos/loan/returnBookRequestDto.js";
import type { ReturnBookResponseDto } from "../../dtos/loan/returnBookResponseDto.js";

export interface ReturnBookUseCaseInterface {
	execute(requestDto: ReturnBookRequestDto): Promise<ReturnBookResponseDto>;
}
