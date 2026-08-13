import { Router } from "express";

import {
  createCourse,
  getCourseBySlug,
  getUserCourses,
} from "./courses.controller.js";

export const coursesRouter = Router();

coursesRouter.post("/", createCourse);
coursesRouter.get("/", getUserCourses);
coursesRouter.get("/:slug", getCourseBySlug);
