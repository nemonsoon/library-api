// API は開発中も本番と同じ配置に見えるよう /api の下にまとめ、転送側で剥がす。
const API_BASE = "/api";

export type CurrentLoan = {
	id: string;
	userId: string;
	userEmail: string;
	loanDate: string;
	dueDate: string;
};

export type Book = {
	id: string;
	title: string;
	isAvailable: boolean;
	createdAt: string;
	currentLoan: CurrentLoan | null;
};

export type User = {
	id: string;
	email: string;
};

export class ApiError extends Error {
	readonly status: number;

	constructor(status: number, message: string) {
		super(message);
		this.name = "ApiError";
		this.status = status;
	}
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return typeof value === "object" && value !== null;
}

function isCurrentLoan(value: unknown): value is CurrentLoan {
	return (
		isRecord(value) &&
		typeof value.id === "string" &&
		typeof value.userId === "string" &&
		typeof value.userEmail === "string" &&
		typeof value.loanDate === "string" &&
		typeof value.dueDate === "string"
	);
}

function isBook(value: unknown): value is Book {
	return (
		isRecord(value) &&
		typeof value.id === "string" &&
		typeof value.title === "string" &&
		typeof value.isAvailable === "boolean" &&
		typeof value.createdAt === "string" &&
		(value.currentLoan === null || isCurrentLoan(value.currentLoan))
	);
}

function isUser(value: unknown): value is User {
	return (
		isRecord(value) &&
		typeof value.id === "string" &&
		typeof value.email === "string"
	);
}

// API は失敗の理由を { error: string } で返す。読めない形で返ってきたときだけ状態番号で補う。
// 転送先が起動していないと、開発サーバーが本文なしの 500 を返すので、そこもここで受ける。
function messageOf(body: unknown, status: number): string {
	if (isRecord(body) && typeof body.error === "string" && body.error !== "") {
		return body.error;
	}
	if (status >= 500) {
		return "API から応答を受け取れなかった。起動しているかを確かめる。";
	}
	return `要求が受け付けられなかった。(${status})`;
}

async function call(path: string, init?: RequestInit): Promise<unknown> {
	let response: Response;
	try {
		response = await fetch(`${API_BASE}${path}`, init);
	} catch {
		throw new ApiError(0, "API に接続できない。起動しているかを確かめる。");
	}

	const body = await response.json().catch(() => null);
	if (!response.ok) {
		throw new ApiError(response.status, messageOf(body, response.status));
	}
	return body;
}

function postJson(body: unknown): RequestInit {
	return {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	};
}

export async function fetchBooks(): Promise<Book[]> {
	const body = await call("/books");
	if (!Array.isArray(body) || !body.every(isBook)) {
		throw new ApiError(0, "本の一覧を解釈できない形で受け取った。");
	}
	return body;
}

export async function fetchUsers(): Promise<User[]> {
	const body = await call("/users");
	if (!Array.isArray(body) || !body.every(isUser)) {
		throw new ApiError(0, "ユーザーの一覧を解釈できない形で受け取った。");
	}
	return body;
}

export async function createBook(title: string): Promise<void> {
	await call("/books", postJson({ title }));
}

export async function createLoan(
	bookId: string,
	userId: string,
): Promise<void> {
	await call("/loans", postJson({ bookId, userId }));
}

export async function returnLoan(loanId: string): Promise<void> {
	await call("/loans/return", postJson({ id: loanId }));
}
