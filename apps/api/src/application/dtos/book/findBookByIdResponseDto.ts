export interface FindBookByIdResponseDto {
	id: string;
	title: string;
	isAvailable: boolean;
	createdAt: Date;
	updatedAt: Date;
}
