import { generateText, Output } from "ai";
import { lessonModel } from "../../lib/ai.js";
import { lessonContentSchema } from "./lessons.schemas.js";
import { lessonsRepository } from "./lessons.repository.js";

export const lessonsService = {
  generateLessonContent: async (
    lessonTitle: string,
    objectives: string[],
    signal: AbortSignal,
  ) => {
    const result = await generateText({
      model: lessonModel,
      abortSignal: signal,
      maxOutputTokens: 8000,
      output: Output.object({
        name: "LessonContent",
        description: "The generated markdown content of the lesson",
        schema: lessonContentSchema,
      }),
      system:
        "You are a senior technical writer and software engineer. Your task is to write detailed, high-quality, and practical lesson content in markdown format, with code examples and clear explanations. Return a JSON object with a single 'contents' property containing the lesson markdown.",
      prompt:
        `Generate the detailed content for a lesson.\n\n` +
        `Lesson Title: "${lessonTitle}"\n` +
        `Lesson Objectives:\n${objectives.map((obj) => `- ${obj}`).join("\n")}\n\n` +
        `Return a JSON object where the "contents" field contains the complete, in-depth lesson content written in markdown format.`,
    });

    // .output throws AI_NoOutputGeneratedError with no context when the model
    // doesn't finish with finishReason "stop" (e.g. hit maxOutputTokens, or the
    // provider rejected/truncated it). Log the rest of the result — which is
    // always readable — before letting that opaque error propagate.
    try {
      return result.output;
    } catch (error) {
      console.error("generateLessonContent: no output produced", {
        finishReason: result.finishReason,
        rawFinishReason: result.rawFinishReason,
        warnings: result.warnings,
        textLength: result.text?.length,
        textPreview: result.text?.slice(0, 1000),
      });
      throw error;
    }
  },

  getLesson: async (lessonId: string) => {
    return lessonsRepository.findById(lessonId);
  },

  getLessonProgress: async (lessonId: string, userId: string) => {
    return lessonsRepository.findProgress(userId, lessonId);
  },

  isUserEnrolled: async (userId: string, courseId: string) => {
    return lessonsRepository.findEnrollment(userId, courseId);
  },

  updateLessonContents: async (lessonId: string, contents: string) => {
    return lessonsRepository.update(lessonId, contents);
  },

  setLessonProgressStatus: async (lessonId: string, userId: string, status: "in_progress" | "completed") => {
    return lessonsRepository.upsertProgress(userId, lessonId, status);
  }
};