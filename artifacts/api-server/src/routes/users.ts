import { Router, type IRouter } from "express";
import { eq, desc } from "drizzle-orm";
import { db, notesTable, usersTable, likesTable } from "@workspace/db";
import { GetUserNotesParams } from "@workspace/api-zod";
import { optionalAuth } from "../lib/auth";

const router: IRouter = Router();

router.get("/users/:id/notes", optionalAuth, async (req, res): Promise<void> => {
  const params = GetUserNotesParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [author] = await db
    .select({ id: usersTable.id, name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, params.data.id));

  if (!author) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const notes = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.authorId, params.data.id))
    .orderBy(desc(notesTable.createdAt));

  let likedSet = new Set<number>();
  if (req.userId) {
    const likedRows = await db
      .select({ noteId: likesTable.noteId })
      .from(likesTable)
      .where(eq(likesTable.userId, req.userId));
    likedSet = new Set(likedRows.map((r) => r.noteId));
  }

  res.json(
    notes.map((n) => ({
      id: n.id,
      title: n.title,
      subject: n.subject,
      content: n.content,
      excerpt: n.excerpt ?? n.content.slice(0, 150),
      authorId: n.authorId,
      authorName: author.name,
      authorInitial: author.name.charAt(0).toUpperCase(),
      likes: n.likes,
      views: n.views,
      downloads: n.downloads,
      tags: n.tags,
      fileType: n.fileType,
      isLiked: likedSet.has(n.id),
      createdAt: n.createdAt,
    })),
  );
});

export default router;
