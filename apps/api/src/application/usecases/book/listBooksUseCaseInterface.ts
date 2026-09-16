import type { ListBooksResponseDto } from "../../dtos/book/listBooksResponseDto.js";

export interface ListBooksUseCaseInterface {
	execute(): Promise<ListBooksResponseDto>;
}
