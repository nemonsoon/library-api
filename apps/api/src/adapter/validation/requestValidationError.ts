// リクエストの形が仕様と違うことを表す。
// 値が業務の規則に反している場合は DomainRuleError の側で扱う。
export class RequestValidationError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
