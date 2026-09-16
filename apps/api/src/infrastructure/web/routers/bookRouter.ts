import { Router } from "express";
import type { BookController } from "../../../adapter/controllers/bookController.js";

export function bookRoutes(bookController: BookController): Router {
	const router = Router();
	router.post("/", bookController.add.bind(bookController));
	router.get("/:id", bookController.findById.bind(bookController));
	return router;
}
