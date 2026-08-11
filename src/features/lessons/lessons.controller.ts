import type { RequestHandler } from "express";
import { lessonsService } from "./lessons.service.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { lessonParamsSchema } from "./lessons.schemas.js";

export const createLessonContent: RequestHandler = async (req, res, next) => {
  const parsed = lessonParamsSchema.safeParse(req.params);

  if (!parsed.success) {
    res.status(400).json({
      message: "Invalid request parameters",
      issues: parsed.error.issues,
    });
    return;
  }

  const { id: lessonId } = parsed.data;

  try {
    const lessonRecord = await lessonsService.getLesson(lessonId);

    if (!lessonRecord) {
      throw new NotFoundError("Lesson not found");
    }

    if (lessonRecord.contents) {
      throw new BadRequestError("Lesson already has content");
    }

    const controller = new AbortController();

    const generatedData = await lessonsService.generateLessonContent(
      lessonRecord.title,
      lessonRecord.objectives,
      controller.signal,
    );

    const result = await lessonsService.updateLessonContents(
      lessonRecord.id,
      generatedData.contents,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
