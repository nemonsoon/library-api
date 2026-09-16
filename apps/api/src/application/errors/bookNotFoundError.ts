import { ResourceNotFoundError } from "./resourceNotFoundError.js";

export class BookNotFoundError extends ResourceNotFoundError {
	constructor() {
		super("書籍が見つかりませんでした。");
	}
}
