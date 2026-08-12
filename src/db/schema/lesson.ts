import {
  pgEnum,
  pgTable,
  text,
  timestamp,
  uuid,
  integer,
  index,
  unique,
} from "drizzle-orm/pg-core";
import { chapter } from "./course.js";
import { user } from "./auth.js";

export const lesson = pgTable(
  "lesson",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    chapterId: uuid("chapter_id")
      .notNull()
      .references(() => chapter.id, { onDelete: "cascade" }),
    position: integer("position").notNull(),
    title: text("title").notNull(),
    contents: text("contents"),
    objectives: text("objectives").array().notNull().default([]),
  },
  (table) => [
    index("lesson_chapterId_idx").on(table.chapterId),
    unique("lesson_chapterId_position_unq").on(table.chapterId, table.position),
  ],
);



export const lessonProgressStatus = pgEnum("lesson_progress_status", [
  "in_progress",
  "completed",
]);

export const lessonProgress = pgTable(
  "lesson_progress",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    lessonId: uuid("lesson_id")
      .notNull()
      .references(() => lesson.id, { onDelete: "cascade" }),
    status: lessonProgressStatus("status").default("in_progress").notNull(),
    startedAt: timestamp("started_at").defaultNow().notNull(),
    completedAt: timestamp("completed_at"),
  },
  (table) => [
    index("lesson_progress_userId_lessonId_idx").on(table.userId, table.lessonId),
    unique("lesson_progress_userId_lessonId_unq").on(table.userId, table.lessonId),
  ]
);
