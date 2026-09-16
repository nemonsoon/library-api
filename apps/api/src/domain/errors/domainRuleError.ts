// 業務ルールに反する操作を表す。
// 呼び出し側の操作が原因であり、サーバー側の障害とは区別する。
export abstract class DomainRuleError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
