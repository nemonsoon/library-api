import { z } from "zod";

// ここで確かめるのは受け取った値の「形」だけで、業務の規則は Domain 層が持つ。
// 例えば「貸出中の書籍は貸し出せない」は Book が判断するため、ここには書かない。

export const addBookBodySchema = z.object({
	title: z
		.string({ error: "タイトルは文字列で指定してください。" })
		.min(1, { error: "タイトルを入力してください。" }),
});

export const createUserBodySchema = z.object({
	email: z.email({ error: "メールアドレスの形式が正しくありません。" }),
});

export const loanBookBodySchema = z.object({
	bookId: z.uuid({ error: "書籍の識別子が正しくありません。" }),
	userId: z.uuid({ error: "ユーザーの識別子が正しくありません。" }),
});

export const returnBookBodySchema = z.object({
	id: z.uuid({ error: "貸出の識別子が正しくありません。" }),
});
