import { z } from "zod";

// ここで確かめるのは受け取った値の「形」だけで、業務の規則は Domain 層が持つ。
// 例えば「貸出中の書籍は貸し出せない」は Book が判断するため、ここには書かない。

// 項目が欠けている場合と形が違う場合で読み手のすることは同じなので、文言も揃える
const TITLE_REQUIRED = "タイトルを入力してください。";

export const addBookBodySchema = z.object({
	title: z.string({ error: TITLE_REQUIRED }).min(1, { error: TITLE_REQUIRED }),
});

export const createUserBodySchema = z.object({
	email: z.email({ error: "メールアドレスを正しい形式で入力してください。" }),
});

export const loanBookBodySchema = z.object({
	bookId: z.uuid({ error: "書籍の識別子が正しくありません。" }),
	userId: z.uuid({ error: "ユーザーの識別子が正しくありません。" }),
});

export const returnBookBodySchema = z.object({
	id: z.uuid({ error: "貸出の識別子が正しくありません。" }),
});
