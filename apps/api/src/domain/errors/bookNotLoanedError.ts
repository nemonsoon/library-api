import { DomainRuleError } from "./domainRuleError.js";

export class BookNotLoanedError extends DomainRuleError {
	constructor() {
		super("この書籍は貸し出されていません。");
	}
}
