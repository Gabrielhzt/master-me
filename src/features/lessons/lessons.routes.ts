import { Router } from "express";

import { createLessonContent } from "./lessons.controller.js";

export const lessonsRouter = Router();

lessonsRouter.put("/:id", createLessonContent);