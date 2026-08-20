import { pgTable, serial, text, integer, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";

export const activityTable = pgTable("activity", {
  id: serial("id").primaryKey(),
  type: text("type").notNull(), // upload | like | view | register
  actorId: integer("actor_id").references(() => usersTable.id, {
    onDelete: "set null",
  }),
  actorName: text("actor_name").notNull(),
  description: text("description").notNull(),
  noteTitle: text("note_title"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export type ActivityRow = typeof activityTable.$inferSelect;
