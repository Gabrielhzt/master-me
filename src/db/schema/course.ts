import { relations } from "drizzle-orm";
import {
  pgTable,
  pgEnum,
  text,
  uuid,
  integer,
  timestamp,
  index,
  unique,
} from "drizzle-orm/pg-core";

import { user } from "./auth.js";

export const courseLevel = pgEnum("course_level", [
  "beginner",
  "intermediate",
  "advanced",
]);

export const course = pgTable("course", {
  id: uuid("id").primaryKey().defaultRandom(),
  slug: text("slug").notNull().unique(),
  topic: text("topic").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  level: courseLevel("level").notNull(),
  prerequisites: text("prerequisites").array().notNull().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const chapter = pgTable(
  "chapter",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    summary: text("summary").notNull(),
  },
  (table) => [
    index("chapter_courseId_idx").on(table.courseId),
    unique("chapter_courseId_position_unq").on(table.courseId, table.position),
  ],
);

export const lesson = pgTable(
  "lesson",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapter.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    objectives: text("objectives").array().notNull().default([]),
  },
  (table) => [
    index("lesson_chapterId_idx").on(table.chapterId),
    unique("lesson_chapterId_position_unq").on(table.chapterId, table.position),
  ],
);

export const enrollment = pgTable(
  "enrollment",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    courseId: uuid("course_id")
      .notNull()
      .references(() => course.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [
    index("enrollment_userId_idx").on(table.userId),
    unique("enrollment_userId_courseId_unq").on(table.userId, table.courseId),
  ],
);

export const courseRelations = relations(course, ({ many }) => ({
  chapters: many(chapter),
  enrollments: many(enrollment),
}));

export const chapterRelations = relations(chapter, ({ one, many }) => ({
  course: one(course, {
    fields: [chapter.courseId],
    references: [course.id],
  }),
  lessons: many(lesson),
}));

export const lessonRelations = relations(lesson, ({ one }) => ({
  chapter: one(chapter, {
    fields: [lesson.chapterId],
    references: [chapter.id],
  }),
}));

export const enrollmentRelations = relations(enrollment, ({ one }) => ({
  user: one(user, {
    fields: [enrollment.userId],
    references: [user.id],
  }),
  course: one(course, {
    fields: [enrollment.courseId],
    references: [course.id],
  }),
}));
