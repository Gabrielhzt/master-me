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


