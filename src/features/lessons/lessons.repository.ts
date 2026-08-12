import { and, eq, sql } from "drizzle-orm";
import { db } from "../../db/index.js";
import { enrollment, lesson, lessonProgress } from "../../db/schema/index.js";

export const lessonsRepository = {
  findById: async (lessonId: string) => {
    return db.query.lesson.findFirst({
      where: eq(lesson.id, lessonId),
    });
  },

  findEnrollment: async (userId: string, courseId: string) => {
    const result = await db.query.enrollment.findFirst({
      where: and(
        eq(enrollment.userId, userId),
        eq(enrollment.courseId, courseId),
      ),
    });
    return !!result;
  },

  findProgress: async (userId: string, lessonId: string) => {
    return db.query.lessonProgress.findFirst({
      where: and(
        eq(lessonProgress.userId, userId),
        eq(lessonProgress.lessonId, lessonId),
      ),
    });
  },

  update: async (lessonId: string, contents: string) => {
    const [updated] = await db.update(lesson)
      .set({ contents: contents })
      .where(eq(lesson.id, lessonId))
      .returning({
        id: lesson.id,
        title: lesson.title,
        objectives: lesson.objectives,
        contents: lesson.contents
      });
    return updated;
  },

  /**
   * Upserts the lesson progress record for a user.
   * If a record doesn't exist, it inserts it (defaulting started_at to now).
   * If it already exists for the user/lesson unique constraint:
   * - Updates the status to the new value (e.g. "completed" or "in_progress").
   * - Sets completed_at to current timestamp if status is "completed", otherwise sets/keeps it null.
   * @param userId The ID of the user.
   * @param lessonId The UUID of the lesson.
   * @param status The new progress status ("in_progress" or "completed").
   * @returns The upserted lesson progress record.
   */
  upsertProgress: async (userId: string, lessonId: string, status: "in_progress" | "completed") => {
    const isCompleted = status === "completed";
    const [result] = await db.insert(lessonProgress)
      .values({
        userId,
        lessonId,
        status,
        completedAt: isCompleted ? sql`now()` : null,
      })
      .onConflictDoUpdate({
        target: [lessonProgress.userId, lessonProgress.lessonId],
        set: {
          status,
          completedAt: isCompleted ? sql`now()` : null,
        },
      })
      .returning();
    return result;
  },
};