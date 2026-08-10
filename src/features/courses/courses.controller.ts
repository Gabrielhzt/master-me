import type { RequestHandler } from "express";

import { createCourseSchema } from "./courses.schemas.js";
import { courseService } from "./courses.service.js";

export const createCourse: RequestHandler = async (req, res, next) => {
  const parsed = createCourseSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request body",
      issues: parsed.error.issues,
    });
    return;
  }

  const { id: userId } = res.locals.user;

  const controller = new AbortController();

  req.on("close", () => {
    controller.abort();
  });

  try {
    const result = await courseService.createCourse({
      topic: parsed.data.topic,
      userId,
      signal: controller.signal,
    });

    res.status(result.cached ? 200 : 201).json(result.course);
  } catch (error) {
    next(error);
  }
};
