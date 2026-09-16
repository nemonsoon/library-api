export class User {
	constructor(
		private _id: string,
		private _email: string,
		private _createdAt: Date = new Date(),
		private _updatedAt: Date = new Date(),
	) {}

	get id(): string {
		return this._id;
	}

	get email(): string {
		return this._email;
	}

	get createdAt(): Date {
		return this._createdAt;
	}

	get updatedAt(): Date {
		return this._updatedAt;
	}
}
