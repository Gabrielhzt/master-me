import { Router } from "express";

import { createLessonContent, setLessonProgress } from "./lessons.controller.js";
import { coursesLimiter } from "../courses/courses.middleware.js";

export const lessonsRouter = Router();

lessonsRouter.put("/:id", coursesLimiter, createLessonContent);
lessonsRouter.post("/:id/progress", setLessonProgress);