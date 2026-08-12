import { z } from "zod";

// Capped length shrinks the prompt-injection surface for this field.
export const createCourseSchema = z.object({
  topic: z.string().min(1).max(100),
});

export const courseParamsSchema = z.object({
  slug: z.string().min(1),
});

/** First pass: is this a technology, and what is it actually called? */
export const classificationSchema = z.object({
  accepted: z
    .boolean()
    .describe("True only if the input names a software development technology"),
  canonicalName: z
    .string()
    .describe(
      "The canonical, commonly used name of the technology, e.g. 'Express.js', " +
        "'React Native', 'Next.js'. Empty string when accepted is false.",
    ),
});

export const courseSchema = z.object({
  title: z.string().describe("Course title"),
  description: z
    .string()
    .describe("Two or three sentences on what the course covers"),
  level: z.enum(["beginner", "intermediate", "advanced"]),
  prerequisites: z
    .array(z.string())
    .describe("What a learner should already know before starting"),
  chapters: z
    .array(
      z.object({
        title: z.string(),
        summary: z.string().describe("One or two sentences on this chapter"),
        lessons: z
          .array(
            z.object({
              title: z.string(),
              objectives: z
                .array(z.string())
                .describe("What the learner can do after this lesson"),
            }),
          )
          .describe("Three to five lessons"),
      }),
    )
    .describe("Five to eight chapters, ordered from fundamentals to advanced"),
});

export type Course = z.infer<typeof courseSchema>;
