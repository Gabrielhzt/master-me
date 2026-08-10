import { eq } from "drizzle-orm";

import { db } from "../../db/index.js";
import { chapter, course, enrollment, lesson } from "../../db/schema/index.js";
import type { Course } from "./courses.schemas.js";

/**
 * Dedup key for the shared catalog. Derived from the model's canonical name,
 * not the raw user input, so "expressjs" / "Express.js" / "express" all land on
 * the same course instead of creating three near-duplicates.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    // Symbols are stripped below, not replaced — without these, "C", "C++"
    // and "C#" all collapse to the same slug and collide in the catalog.
    .replace(/\+\+/g, "pp")
    .replace(/#/g, "sharp")
    .normalize("NFKD")
    .replace(/[^\w\s-]/g, "")
    .trim()
    .replace(/[\s_-]+/g, "-");
}

export function findCourseBySlug(slug: string) {
  return db.query.course.findFirst({
    where: eq(course.slug, slug),
    with: {
      chapters: {
        orderBy: (c, { asc }) => [asc(c.position)],
        with: {
          lessons: { orderBy: (l, { asc }) => [asc(l.position)] },
        },
      },
    },
  });
}

/**
 * One transaction, so a partial course can never land in the catalog.
 *
 * On a race between two requests for the same topic, the loser hits the
 * unique slug constraint — `onConflictDoNothing` no-ops it, and the caller
 * re-reads the winner's course.
 */
export async function persistCourse(input: {
  slug: string;
  topic: string;
  generated: Course;
}) {
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
}

/** Idempotent — requesting the same course twice must not fail. */
export async function enroll(userId: string, courseId: string) {
  await db
    .insert(enrollment)
    .values({ userId, courseId })
    .onConflictDoNothing({
      target: [enrollment.userId, enrollment.courseId],
    });
}
