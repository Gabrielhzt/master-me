import { Router } from "express";

import { createCourse } from "./courses.controller.js";

export const coursesRouter = Router();

coursesRouter.post("/", createCourse);
