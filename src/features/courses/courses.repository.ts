import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { chapter, course, enrollment, lesson } from "../../db/schema/index.js";
import type { Course } from "./courses.schemas.js";

export const coursesRepository = {
  slugify: (value: string): string => {
    return value
      .toLowerCase()
      .replace(/\+\+/g, "pp")
      .replace(/#/g, "sharp")
      .normalize("NFKD")
      .replace(/[^\w\s-]/g, "")
      .trim()
      .replace(/[\s_-]+/g, "-");
  },

  findCourseBySlug: (slug: string) => {
    return db.query.course.findFirst({
      where: eq(course.slug, slug),
      with: {
        chapters: {
          orderBy: (c, { asc }) => [asc(c.position)],
          with: {
            lessons: {
              columns: {
                contents: false,
              },
              orderBy: (l, { asc }) => [asc(l.position)],
            },
          },
        },
      },
    });
  },

  persistCourse: async (input: {
    slug: string;
    topic: string;
    generated: Course;
  }) => {
    const { slug, topic, generated } = input;

    await db.transaction(async (tx) => {
      const [inserted] = await tx
        .insert(course)
        .values({
          slug,
          topic,
          title: generated.title,
          description: generated.description,
          level: generated.level,
          prerequisites: generated.prerequisites,
        })
        .onConflictDoNothing({ target: course.slug })
        .returning();

      // Lost the race.
      if (!inserted) return;

      for (const [chapterIndex, ch] of generated.chapters.entries()) {
        const [insertedChapter] = await tx
          .insert(chapter)
          .values({
            courseId: inserted.id,
            position: chapterIndex,
            title: ch.title,
            summary: ch.summary,
          })
          .returning();

        if (!insertedChapter || ch.lessons.length === 0) continue;

        await tx.insert(lesson).values(
          ch.lessons.map((l, lessonIndex) => ({
            chapterId: insertedChapter.id,
            position: lessonIndex,
            title: l.title,
            objectives: l.objectives,
          })),
        );
      }
    });
  },

  enroll: async (userId: string, courseId: string) => {
    await db
      .insert(enrollment)
      .values({ userId, courseId })
      .onConflictDoNothing({
        target: [enrollment.userId, enrollment.courseId],
      });
  },
};
