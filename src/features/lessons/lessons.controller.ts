import type { RequestHandler } from "express";
import { lessonsService } from "./lessons.service.js";
import { BadRequestError, NotFoundError } from "../../lib/errors.js";
import { lessonParamsSchema, lessonProgressBodySchema } from "./lessons.schemas.js";

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

export const setLessonProgress: RequestHandler = async (req, res, next) => {
  const paramsParsed = lessonParamsSchema.safeParse(req.params);

  if (!paramsParsed.success) {
    res.status(400).json({
      message: "Invalid request parameters",
      issues: paramsParsed.error.issues,
    });
    return;
  }

  const bodyParsed = lessonProgressBodySchema.safeParse(req.body);

  if (!bodyParsed.success) {
    res.status(400).json({
      message: "Invalid request body",
      issues: bodyParsed.error.issues,
    });
    return;
  }

  const { id: lessonId } = paramsParsed.data;
  const { status } = bodyParsed.data;
  const user = res.locals.user;

  try {
    const lessonRecord = await lessonsService.getLesson(lessonId);

    if (!lessonRecord) {
      throw new NotFoundError("Lesson not found");
    }

    const currentProgress = await lessonsService.getLessonProgress(lessonId, user.id);
    if (currentProgress && currentProgress.status === "completed" && status === "in_progress") {
      throw new BadRequestError("Cannot set a completed lesson back to in progress");
    }

    const result = await lessonsService.setLessonProgressStatus(
      lessonId,
      user.id,
      status,
    );

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
