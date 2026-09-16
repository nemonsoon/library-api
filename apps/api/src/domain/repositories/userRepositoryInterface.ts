import type { User } from "../entities/user.js";
import type { TransactionContextInterface } from "../utils/transactionContextInterface.js";

export interface UserRepositoryInterface {
	create(user: User): Promise<User>;
	findById(id: string, ctx?: TransactionContextInterface): Promise<User | null>;
	findByIds(ids: string[]): Promise<User[]>;
	findAll(): Promise<User[]>;
}
