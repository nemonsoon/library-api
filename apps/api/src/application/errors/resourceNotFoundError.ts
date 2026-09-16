// 操作の前提となる対象が存在しないことを表す。
// 一覧や検索が0件を返すのは正常なので、この誤りには当たらない。
export abstract class ResourceNotFoundError extends Error {
	constructor(message: string) {
		super(message);
		this.name = this.constructor.name;
	}
}
