import { and, eq } from "drizzle-orm";
import { db } from "../../db/index.js";
import { enrollment, lesson } from "../../db/schema/index.js";

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
  }
};