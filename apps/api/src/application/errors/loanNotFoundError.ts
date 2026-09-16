import { ResourceNotFoundError } from "./resourceNotFoundError.js";

export class LoanNotFoundError extends ResourceNotFoundError {
	constructor() {
		super("貸出が見つかりませんでした。");
	}
}
