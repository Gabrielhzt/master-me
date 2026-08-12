import type { RequestHandler } from "express";

import { courseParamsSchema, createCourseSchema } from "./courses.schemas.js";
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

export const getCourseBySlug: RequestHandler = async (req, res, next) => {
  const parsed = courseParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request parameters",
      issues: parsed.error.issues,
    });
    return;
  }

  try {
    const course = await courseService.getCourseBySlug(parsed.data.slug);

    res.status(200).json(course);
  } catch (error) {
    next(error);
  }
};
