import type { ZodType } from "zod";
import { RequestValidationError } from "./requestValidationError.js";

// 検証に通らなければ、何が足りないかを1つの文にまとめて投げる。
// 応答の形は既存の誤り応答と同じ { error: "..." } に揃える。
export function parseRequestBody<T>(schema: ZodType<T>, body: unknown): T {
	const result = schema.safeParse(body);

	if (!result.success) {
		const message = result.error.issues
			.map((issue) => issue.message)
			.join(" / ");
		throw new RequestValidationError(message);
	}

	return result.data;
}
