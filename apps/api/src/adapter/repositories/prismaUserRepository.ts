import { User } from "../../domain/entities/user.js";
import type { UserRepositoryInterface } from "../../domain/repositories/userRepositoryInterface.js";
import type { TransactionContextInterface } from "../../domain/utils/transactionContextInterface.js";
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

	// ユーザーをIDで取得する
	async findById(
		id: string,
		ctx?: TransactionContextInterface,
	): Promise<User | null> {
		const prisma = ctx ? (ctx as PrismaClient) : this.prisma;
		const foundUser = await prisma.user.findUnique({ where: { id } });

		if (!foundUser) {
			return null;
		}

		return this.toEntity(foundUser);
	}

	// 指定したユーザーをまとめて取得する
	async findByIds(ids: string[]): Promise<User[]> {
		const foundUsers = await this.prisma.user.findMany({
			where: { id: { in: ids } },
		});

		return foundUsers.map((foundUser) => this.toEntity(foundUser));
	}

	// ユーザーをすべて取得する
	async findAll(): Promise<User[]> {
		const foundUsers = await this.prisma.user.findMany({
			orderBy: { createdAt: "asc" },
		});

		return foundUsers.map((foundUser) => this.toEntity(foundUser));
	}

	private toEntity(record: {
		id: string;
		email: string;
		createdAt: Date;
		updatedAt: Date;
	}): User {
		return new User(
			record.id,
			record.email,
			record.createdAt,
			record.updatedAt,
		);
	}
}
