import { DomainRuleError } from "./domainRuleError.js";

export class LoanLimitExceededError extends DomainRuleError {
	constructor(limit: number) {
		super(`同時に借りられるのは${limit}冊までです。`);
	}
}
