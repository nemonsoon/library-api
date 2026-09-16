import type { LoanBookRequestDto } from "../../dtos/loan/loanBookRequestDto.js";
import type { LoanBookResponseDto } from "../../dtos/loan/loanBookResponseDto.js";

export interface LoanBookUseCaseInterface {
	execute(requestDto: LoanBookRequestDto): Promise<LoanBookResponseDto>;
}
