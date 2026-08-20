import { pgTable, integer, primaryKey, timestamp } from "drizzle-orm/pg-core";
import { usersTable } from "./users";
import { notesTable } from "./notes";

export const likesTable = pgTable(
  "likes",
  {
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    noteId: integer("note_id")
      .notNull()
      .references(() => notesTable.id, { onDelete: "cascade" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.noteId] })],
);

export type Like = typeof likesTable.$inferSelect;
