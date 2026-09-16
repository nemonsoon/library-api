export interface UserSummaryDto {
	id: string;
	email: string;
	createdAt: Date;
	updatedAt: Date;
}

export type ListUsersResponseDto = UserSummaryDto[];
