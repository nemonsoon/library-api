// 返却されていない貸出。書籍ごとに最大1件だけ存在する。
export interface CurrentLoanDto {
	id: string;
	userId: string;
	userEmail: string;
	loanDate: Date;
	dueDate: Date;
}

export interface BookWithLoanDto {
	id: string;
	title: string;
	isAvailable: boolean;
	currentLoan: CurrentLoanDto | null;
	createdAt: Date;
	updatedAt: Date;
}

export type ListBooksResponseDto = BookWithLoanDto[];
