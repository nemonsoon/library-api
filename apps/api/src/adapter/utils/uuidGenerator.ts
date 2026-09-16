import { v4 as uuidv4 } from "uuid";
import type { IdGeneratorInterface } from "../../domain/utils/idGeneratorInterface.js";

export class UuidGenerator implements IdGeneratorInterface {
	generate(): string {
		return uuidv4();
	}
}
