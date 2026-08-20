import { Router, type IRouter } from "express";
import { eq, desc, ilike, or, sql, and, inArray } from "drizzle-orm";
import { db, notesTable, usersTable, likesTable, activityTable } from "@workspace/db";
import {
  ListNotesQueryParams,
  CreateNoteBody,
  GetNoteParams,
  UpdateNoteParams,
  UpdateNoteBody,
  DeleteNoteParams,
  ToggleLikeParams,
  RecordViewParams,
} from "@workspace/api-zod";
import { requireAuth, optionalAuth } from "../lib/auth";

const router: IRouter = Router();

function buildNoteResponse(
  note: typeof notesTable.$inferSelect,
  author: { name: string } | undefined,
  likedByCurrentUser: boolean,
) {
  const authorName = author?.name ?? "Unknown";
  return {
    id: note.id,
    title: note.title,
    subject: note.subject,
    content: note.content,
    excerpt: note.excerpt ?? note.content.slice(0, 150),
    authorId: note.authorId,
    authorName,
    authorInitial: authorName.charAt(0).toUpperCase(),
    likes: note.likes,
    views: note.views,
    downloads: note.downloads,
    tags: note.tags,
    fileType: note.fileType,
    isLiked: likedByCurrentUser,
    createdAt: note.createdAt,
  };
}

router.get("/notes/stats", optionalAuth, async (req, res): Promise<void> => {
  const [[totalNotes], [totalUsers], [totalLikes], [totalViews]] =
    await Promise.all([
      db.select({ count: sql<number>`count(*)::int` }).from(notesTable),
      db.select({ count: sql<number>`count(*)::int` }).from(usersTable),
      db
        .select({ sum: sql<number>`coalesce(sum(likes), 0)::int` })
        .from(notesTable),
      db
        .select({ sum: sql<number>`coalesce(sum(views), 0)::int` })
        .from(notesTable),
    ]);

  let myNotes = 0;
  let myLikes = 0;
  if (req.userId) {
    const [[mn], [ml]] = await Promise.all([
      db
        .select({ count: sql<number>`count(*)::int` })
        .from(notesTable)
        .where(eq(notesTable.authorId, req.userId)),
      db
        .select({ sum: sql<number>`coalesce(sum(likes), 0)::int` })
        .from(notesTable)
        .where(eq(notesTable.authorId, req.userId)),
    ]);
    myNotes = mn.count;
    myLikes = ml.sum;
  }

  res.json({
    totalNotes: totalNotes.count,
    totalUsers: totalUsers.count,
    totalLikes: totalLikes.sum,
    totalViews: totalViews.sum,
    myNotes,
    myLikes,
  });
});

router.get("/notes/trending", optionalAuth, async (req, res): Promise<void> => {
  const notes = await db
    .select()
    .from(notesTable)
    .orderBy(desc(notesTable.likes))
    .limit(6);

  const authorIds = [...new Set(notes.map((n) => n.authorId))];
  const authors = authorIds.length
    ? await db
        .select({ id: usersTable.id, name: usersTable.name })
        .from(usersTable)
        .where(inArray(usersTable.id, authorIds))
    : [];
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  let likedSet = new Set<number>();
  if (req.userId) {
    const likedRows = await db
      .select({ noteId: likesTable.noteId })
      .from(likesTable)
      .where(eq(likesTable.userId, req.userId));
    likedSet = new Set(likedRows.map((r) => r.noteId));
  }

  res.json(
    notes.map((n) =>
      buildNoteResponse(n, authorMap.get(n.authorId), likedSet.has(n.id)),
    ),
  );
});

router.get("/notes/activity", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(activityTable)
    .orderBy(desc(activityTable.createdAt))
    .limit(20);

  res.json(
    rows.map((r) => ({
      id: r.id,
      type: r.type,
      actorName: r.actorName,
      description: r.description,
      noteTitle: r.noteTitle,
      createdAt: r.createdAt,
    })),
  );
});

router.get("/notes", optionalAuth, async (req, res): Promise<void> => {
  const qp = ListNotesQueryParams.safeParse(req.query);
  const { search, subject, sort } = qp.success
    ? qp.data
    : { search: undefined, subject: undefined, sort: undefined };

  let query = db.select().from(notesTable).$dynamic();

  const filters = [];
  if (search) {
    filters.push(
      or(
        ilike(notesTable.title, `%${search}%`),
        ilike(notesTable.subject, `%${search}%`),
        sql`${notesTable.tags}::text ilike ${"%" + search + "%"}`,
      ),
    );
  }
  if (subject && subject !== "all") {
    filters.push(ilike(notesTable.subject, subject));
  }
  if (filters.length) {
    query = query.where(and(...filters));
  }

  if (sort === "popular") {
    query = query.orderBy(desc(notesTable.likes));
  } else if (sort === "viewed") {
    query = query.orderBy(desc(notesTable.views));
  } else {
    query = query.orderBy(desc(notesTable.createdAt));
  }

  const notes = await query.limit(50);

  const authorIds = [...new Set(notes.map((n) => n.authorId))];
  const authors = authorIds.length
    ? await db
        .select({ id: usersTable.id, name: usersTable.name })
        .from(usersTable)
        .where(inArray(usersTable.id, authorIds))
    : [];
  const authorMap = new Map(authors.map((a) => [a.id, a]));

  let likedSet = new Set<number>();
  if (req.userId) {
    const likedRows = await db
      .select({ noteId: likesTable.noteId })
      .from(likesTable)
      .where(eq(likesTable.userId, req.userId));
    likedSet = new Set(likedRows.map((r) => r.noteId));
  }

  res.json(
    notes.map((n) =>
      buildNoteResponse(n, authorMap.get(n.authorId), likedSet.has(n.id)),
    ),
  );
});

router.post("/notes", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [author] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, req.userId!));

  const excerpt = parsed.data.content.slice(0, 150);

  const [note] = await db
    .insert(notesTable)
    .values({
      title: parsed.data.title,
      subject: parsed.data.subject,
      content: parsed.data.content,
      excerpt,
      authorId: req.userId!,
      tags: parsed.data.tags ?? [],
      fileType: parsed.data.fileType ?? "notes",
    })
    .returning();

  await db
    .update(usersTable)
    .set({ notesCount: sql`${usersTable.notesCount} + 1` })
    .where(eq(usersTable.id, req.userId!));

  await db.insert(activityTable).values({
    type: "upload",
    actorId: req.userId!,
    actorName: author?.name ?? "Unknown",
    description: `${author?.name ?? "Someone"} uploaded a new note`,
    noteTitle: note.title,
  });

  res.status(201).json(buildNoteResponse(note, author, false));
});

router.get("/notes/:id", optionalAuth, async (req, res): Promise<void> => {
  const params = GetNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const [author] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, note.authorId));

  let isLiked = false;
  if (req.userId) {
    const [like] = await db
      .select()
      .from(likesTable)
      .where(
        and(eq(likesTable.userId, req.userId), eq(likesTable.noteId, note.id)),
      );
    isLiked = !!like;
  }

  res.json(buildNoteResponse(note, author, isLiked));
});

router.patch("/notes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = UpdateNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateNoteBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  if (existing.authorId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  const updates: Partial<typeof notesTable.$inferInsert> = {};
  if (parsed.data.title != null) updates.title = parsed.data.title;
  if (parsed.data.subject != null) updates.subject = parsed.data.subject;
  if (parsed.data.content != null) {
    updates.content = parsed.data.content;
    updates.excerpt = parsed.data.content.slice(0, 150);
  }
  if (parsed.data.tags != null) updates.tags = parsed.data.tags;

  const [note] = await db
    .update(notesTable)
    .set(updates)
    .where(eq(notesTable.id, params.data.id))
    .returning();

  const [author] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, note.authorId));

  res.json(buildNoteResponse(note, author, false));
});

router.delete("/notes/:id", requireAuth, async (req, res): Promise<void> => {
  const params = DeleteNoteParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  if (existing.authorId !== req.userId) {
    res.status(403).json({ error: "Forbidden" });
    return;
  }

  await db.delete(notesTable).where(eq(notesTable.id, params.data.id));

  await db
    .update(usersTable)
    .set({ notesCount: sql`greatest(${usersTable.notesCount} - 1, 0)` })
    .where(eq(usersTable.id, req.userId!));

  res.sendStatus(204);
});

router.post("/notes/:id/like", requireAuth, async (req, res): Promise<void> => {
  const params = ToggleLikeParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db
    .select()
    .from(notesTable)
    .where(eq(notesTable.id, params.data.id));

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const [existingLike] = await db
    .select()
    .from(likesTable)
    .where(
      and(
        eq(likesTable.userId, req.userId!),
        eq(likesTable.noteId, params.data.id),
      ),
    );

  if (existingLike) {
    await db
      .delete(likesTable)
      .where(
        and(
          eq(likesTable.userId, req.userId!),
          eq(likesTable.noteId, params.data.id),
        ),
      );
    const [updated] = await db
      .update(notesTable)
      .set({ likes: sql`greatest(${notesTable.likes} - 1, 0)` })
      .where(eq(notesTable.id, params.data.id))
      .returning();
    await db
      .update(usersTable)
      .set({
        likesReceived: sql`greatest(${usersTable.likesReceived} - 1, 0)`,
      })
      .where(eq(usersTable.id, note.authorId));
    res.json({ liked: false, likes: updated.likes });
  } else {
    await db
      .insert(likesTable)
      .values({ userId: req.userId!, noteId: params.data.id });
    const [updated] = await db
      .update(notesTable)
      .set({ likes: sql`${notesTable.likes} + 1` })
      .where(eq(notesTable.id, params.data.id))
      .returning();
    await db
      .update(usersTable)
      .set({ likesReceived: sql`${usersTable.likesReceived} + 1` })
      .where(eq(usersTable.id, note.authorId));

    const [actor] = await db
      .select({ name: usersTable.name })
      .from(usersTable)
      .where(eq(usersTable.id, req.userId!));
    await db.insert(activityTable).values({
      type: "like",
      actorId: req.userId!,
      actorName: actor?.name ?? "Someone",
      description: `${actor?.name ?? "Someone"} liked a note`,
      noteTitle: note.title,
    });

    res.json({ liked: true, likes: updated.likes });
  }
});

router.post("/notes/:id/view", optionalAuth, async (req, res): Promise<void> => {
  const params = RecordViewParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [note] = await db
    .update(notesTable)
    .set({ views: sql`${notesTable.views} + 1` })
    .where(eq(notesTable.id, params.data.id))
    .returning();

  if (!note) {
    res.status(404).json({ error: "Note not found" });
    return;
  }

  const [author] = await db
    .select({ name: usersTable.name })
    .from(usersTable)
    .where(eq(usersTable.id, note.authorId));

  let isLiked = false;
  if (req.userId) {
    const [like] = await db
      .select()
      .from(likesTable)
      .where(
        and(eq(likesTable.userId, req.userId), eq(likesTable.noteId, note.id)),
      );
    isLiked = !!like;
  }

  res.json(buildNoteResponse(note, author, isLiked));
});

export default router;
