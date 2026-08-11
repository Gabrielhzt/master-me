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
    const { output } = await generateText({
      model: lessonModel,
      abortSignal: signal,
      maxOutputTokens: 4000,
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

    return output;
  },

  getLesson: async (lessonId: string) => {
    return lessonsRepository.findById(lessonId);
  },

  isUserEnrolled: async (userId: string, courseId: string) => {
    return lessonsRepository.findEnrollment(userId, courseId);
  },

  updateLessonContents: async (lessonId: string, contents: string) => {
    return lessonsRepository.update(lessonId, contents);
  }
};