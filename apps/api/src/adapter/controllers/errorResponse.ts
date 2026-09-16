import type { Response } from "express";
import { ResourceNotFoundError } from "../../application/errors/resourceNotFoundError.js";
import { DomainRuleError } from "../../domain/errors/domainRuleError.js";
import { RequestValidationError } from "../validation/requestValidationError.js";

// 業務上の失敗と想定外の失敗を、呼び出し側が区別できる形にして返す。
// 想定外の失敗だけが 500 になり、そのときだけ内容をログに残す。
export function sendErrorResponse(
	res: Response,
	error: unknown,
	fallbackMessage: string,
): void {
	if (error instanceof RequestValidationError) {
		res.status(400).json({ error: error.message });
		return;
	}

	if (error instanceof ResourceNotFoundError) {
		res.status(404).json({ error: error.message });
		return;
	}

	if (error instanceof DomainRuleError) {
		res.status(409).json({ error: error.message });
		return;
	}

	console.error(error);
	res.status(500).json({ error: fallbackMessage });
}
