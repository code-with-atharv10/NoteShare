import { useEffect } from "react";
import { useRoute, Link, useLocation } from "wouter";
import {
  useGetNote,
  useToggleLike,
  useRecordView,
  useDeleteNote,
  getGetNoteQueryKey,
  getListNotesQueryKey,
  getGetNotesStatsQueryKey,
  getGetTrendingNotesQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import {
  Heart, Eye, Download, ArrowLeft, Pencil, Trash2, User, Clock,
  FileText, Share2
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

export default function NoteDetail() {
  const [, params] = useRoute("/notes/:id");
  const noteId = params?.id ? parseInt(params.id, 10) : null;
  const [, setLocation] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: note, isLoading } = useGetNote(noteId!, {
    query: {
      enabled: !!noteId,
      queryKey: getGetNoteQueryKey(noteId!),
    },
  });

  const recordViewMutation = useRecordView();
  const toggleLikeMutation = useToggleLike();
  const deleteNoteMutation = useDeleteNote();

  useEffect(() => {
    if (noteId) {
      recordViewMutation.mutate({ id: noteId });
    }
  }, [noteId]);

  const handleLike = () => {
    if (!isAuthenticated) {
      toast({ title: "Sign in to like", description: "Create a free account to like notes.", variant: "destructive" });
      return;
    }
    toggleLikeMutation.mutate(
      { id: noteId! },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetNoteQueryKey(noteId!) });
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetTrendingNotesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetNotesStatsQueryKey() });
        },
      },
    );
  };

  const handleDelete = () => {
    if (!confirm("Delete this note? This cannot be undone.")) return;
    deleteNoteMutation.mutate(
      { id: noteId! },
      {
        onSuccess: () => {
          toast({ title: "Note deleted" });
          queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetNotesStatsQueryKey() });
          setLocation("/notes");
        },
        onError: () => {
          toast({ title: "Delete failed", variant: "destructive" });
        },
      },
    );
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast({ title: "Link copied", description: "Note URL copied to clipboard." });
  };

  const isOwner = user?.id === note?.authorId;

  if (isLoading) {
    return (
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 max-w-4xl space-y-6">
          <Skeleton className="h-8 w-32" />
          <Skeleton className="h-12 w-3/4" />
          <div className="flex gap-2">
            <Skeleton className="h-6 w-20" />
            <Skeleton className="h-6 w-20" />
          </div>
          <Skeleton className="h-96 w-full" />
        </div>
      </div>
    );
  }

  if (!note) {
    return (
      <div className="flex-1 flex items-center justify-center bg-background">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-2">Note not found</h2>
          <p className="text-muted-foreground mb-4">This note may have been deleted.</p>
          <Button asChild variant="outline" className="border-2 border-border">
            <Link href="/notes">Back to Notes</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Back */}
        <Link
          href="/notes"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground mb-6 transition-colors group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform" />
          Back to Notes
        </Link>

        {/* Header card */}
        <div className="bg-card border-2 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="font-mono text-xs border-2">
                {note.subject}
              </Badge>
              <Badge variant="secondary" className="font-mono text-xs flex items-center gap-1">
                <FileText className="h-3 w-3" />
                {note.fileType.toUpperCase()}
              </Badge>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8 border-2 border-border"
                onClick={handleShare}
                data-testid="button-share"
              >
                <Share2 className="h-3.5 w-3.5 mr-1.5" /> Share
              </Button>
              {isOwner && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 border-2 border-border"
                    asChild
                  >
                    <Link href={`/notes/${note.id}/edit`}>
                      <Pencil className="h-3.5 w-3.5 mr-1.5" /> Edit
                    </Link>
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="h-8 border-2 border-destructive-border"
                    onClick={handleDelete}
                    disabled={deleteNoteMutation.isPending}
                    data-testid="button-delete"
                  >
                    <Trash2 className="h-3.5 w-3.5 mr-1.5" /> Delete
                  </Button>
                </>
              )}
            </div>
          </div>

          <h1 className="text-3xl font-bold font-serif mb-4 leading-tight">{note.title}</h1>

          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-xs border border-border">
                {note.authorInitial || note.authorName.charAt(0)}
              </div>
              <span className="font-medium text-foreground">{note.authorName}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
            </div>
          </div>

          {/* Tags */}
          {note.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-4">
              {note.tags.map((tag) => (
                <Badge key={tag} variant="secondary" className="text-xs font-mono">
                  #{tag}
                </Badge>
              ))}
            </div>
          )}

          {/* Stats + Like */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
            <div className="flex items-center gap-5 text-sm text-muted-foreground font-mono">
              <div className="flex items-center gap-1.5">
                <Eye className="h-4 w-4" />
                <span>{note.views} views</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Download className="h-4 w-4" />
                <span>{note.downloads} downloads</span>
              </div>
            </div>
            <Button
              variant={note.isLiked ? "default" : "outline"}
              size="sm"
              onClick={handleLike}
              disabled={toggleLikeMutation.isPending}
              className={`border-2 border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-[1px] transition-all font-bold ${
                note.isLiked ? "bg-accent border-accent-border text-accent-foreground" : ""
              }`}
              data-testid="button-like"
            >
              <Heart className={`mr-1.5 h-4 w-4 ${note.isLiked ? "fill-current" : ""}`} />
              {note.likes} {note.isLiked ? "Liked" : "Like"}
            </Button>
          </div>
        </div>

        {/* Content */}
        <div className="bg-card border-2 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] rounded-xl p-6">
          <h2 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">Content</h2>
          <div className="prose prose-sm max-w-none dark:prose-invert font-mono text-sm leading-relaxed whitespace-pre-wrap">
            {note.content}
          </div>
        </div>
      </div>
    </div>
  );
}
