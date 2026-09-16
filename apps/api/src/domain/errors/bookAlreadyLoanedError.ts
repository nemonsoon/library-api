import { DomainRuleError } from "./domainRuleError.js";

export class BookAlreadyLoanedError extends DomainRuleError {
	constructor() {
		super("この書籍は既に貸出中です。");
	}
}
