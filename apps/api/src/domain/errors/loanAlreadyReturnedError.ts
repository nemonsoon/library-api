import { DomainRuleError } from "./domainRuleError.js";

export class LoanAlreadyReturnedError extends DomainRuleError {
	constructor() {
		super("この貸出は既に返却されています。");
	}
}
