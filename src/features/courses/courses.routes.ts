import { Router } from "express";

import { createCourse, getCourseBySlug } from "./courses.controller.js";

export const coursesRouter = Router();

coursesRouter.post("/", createCourse);
coursesRouter.get("/:slug", getCourseBySlug);
