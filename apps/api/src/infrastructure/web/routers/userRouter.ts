import { Router } from "express";
import type { UserController } from "../../../adapter/controllers/userController.js";

export function userRoutes(userController: UserController): Router {
	const router = Router();
	router.post("/", userController.create.bind(userController));
	return router;
}
