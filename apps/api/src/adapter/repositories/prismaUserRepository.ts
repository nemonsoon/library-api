import { User } from "../../domain/entities/user.js";
import type { UserRepositoryInterface } from "../../domain/repositories/userRepositoryInterface.js";
import type { PrismaClient } from "../../generated/prisma/client.js";

export class PrismaUserRepository implements UserRepositoryInterface {
	constructor(private readonly prisma: PrismaClient) {}

	// ユーザーを作成する
	async create(user: User): Promise<User> {
		const createdUser = await this.prisma.user.create({
			data: {
				id: user.id,
				email: user.email,
				createdAt: user.createdAt,
				updatedAt: user.updatedAt,
			},
		});

		return new User(
			createdUser.id,
			createdUser.email,
			createdUser.createdAt,
			createdUser.updatedAt,
		);
	}
}
