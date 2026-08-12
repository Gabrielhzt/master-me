import { z } from "zod";

export const lessonParamsSchema = z.object({
  id: z.string().uuid("Invalid lesson ID"),
});

export const lessonContentSchema = z.object({
  contents: z
    .string()
    .describe("The content of the lesson in markdown format"),
});

export const lessonProgressBodySchema = z.object({
  status: z.enum(["in_progress", "completed"]),
});