import { ResourceNotFoundError } from "./resourceNotFoundError.js";

export class UserNotFoundError extends ResourceNotFoundError {
	constructor() {
		super("ユーザーが見つかりませんでした。");
	}
}
