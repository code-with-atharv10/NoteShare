import { Link } from "wouter";
import {
  useGetNotesStats,
  useGetTrendingNotes,
  useGetRecentActivity,
  useListNotes,
  getGetNotesStatsQueryKey,
  getGetTrendingNotesQueryKey,
  getGetRecentActivityQueryKey,
  getListNotesQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { NoteCard } from "@/components/NoteCard";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  FileText, Upload, TrendingUp, Users, Heart, Eye, BookOpen, Clock, Activity
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

function StatCard({ icon: Icon, label, value, color }: {
  icon: typeof FileText;
  label: string;
  value: number | string | undefined;
  color: string;
}) {
  return (
    <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] rounded-xl p-5 flex items-center gap-4">
      <div className={`p-3 rounded-lg border-2 border-border ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <p className="text-2xl font-bold font-mono">{value ?? <Skeleton className="h-7 w-12 inline-block" />}</p>
        <p className="text-xs text-muted-foreground uppercase tracking-wider font-medium">{label}</p>
      </div>
    </div>
  );
}

function ActivityIcon({ type }: { type: string }) {
  switch (type) {
    case "upload": return <Upload className="h-3.5 w-3.5 text-primary" />;
    case "like": return <Heart className="h-3.5 w-3.5 text-accent" />;
    case "view": return <Eye className="h-3.5 w-3.5 text-secondary-foreground" />;
    case "register": return <Users className="h-3.5 w-3.5 text-green-600" />;
    default: return <Activity className="h-3.5 w-3.5" />;
  }
}

export default function Dashboard() {
  const { user } = useAuth();

  const { data: stats } = useGetNotesStats({
    query: { queryKey: getGetNotesStatsQueryKey() },
  });

  const { data: trending, isLoading: trendingLoading } = useGetTrendingNotes({
    query: { queryKey: getGetTrendingNotesQueryKey() },
  });

  const { data: activity, isLoading: activityLoading } = useGetRecentActivity({
    query: { queryKey: getGetRecentActivityQueryKey() },
  });

  const { data: myNotesList, isLoading: myNotesLoading } = useListNotes(
    {},
    { query: { queryKey: getListNotesQueryKey() } },
  );
  const myNotes = myNotesList?.filter((n) => n.authorId === user?.id) ?? [];

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-8 max-w-6xl space-y-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold font-serif">
              Good {new Date().getHours() < 12 ? "morning" : new Date().getHours() < 17 ? "afternoon" : "evening"},{" "}
              <span className="text-primary">{user?.name.split(" ")[0]}</span>
            </h1>
            <p className="text-muted-foreground mt-1">Here's what's happening in your commons</p>
          </div>
          <Button
            asChild
            className="border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-[2px] transition-all font-bold"
          >
            <Link href="/notes/upload">
              <Upload className="mr-2 h-4 w-4" /> Upload Notes
            </Link>
          </Button>
        </div>

        {/* Platform Stats */}
        <section>
          <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform Stats</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <StatCard icon={FileText} label="Total Notes" value={stats?.totalNotes} color="bg-primary text-primary-foreground" />
            <StatCard icon={Users} label="Students" value={stats?.totalUsers} color="bg-secondary text-secondary-foreground" />
            <StatCard icon={Heart} label="Total Likes" value={stats?.totalLikes} color="bg-accent text-accent-foreground" />
            <StatCard icon={Eye} label="Total Views" value={stats?.totalViews} color="bg-muted text-foreground" />
          </div>
        </section>

        {/* My Stats */}
        {user && (
          <section>
            <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">My Activity</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] rounded-xl p-5 text-center">
                <p className="text-3xl font-bold font-mono text-primary">{stats?.myNotes ?? 0}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">My Notes</p>
              </div>
              <div className="bg-card border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] rounded-xl p-5 text-center">
                <p className="text-3xl font-bold font-mono text-accent">{stats?.myLikes ?? 0}</p>
                <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Likes Received</p>
              </div>
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-2 gap-8">
          {/* Trending Notes */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-primary" /> Trending
              </h2>
              <Link href="/notes?sort=popular" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                View all
              </Link>
            </div>
            {trendingLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-20 w-full rounded-lg" />)}
              </div>
            ) : (trending?.slice(0, 4).map((note) => (
              <Link key={note.id} href={`/notes/${note.id}`}>
                <div
                  data-testid={`card-trending-${note.id}`}
                  className="flex items-center gap-3 p-3 rounded-lg border-2 border-border bg-card hover:bg-muted transition-colors cursor-pointer mb-2 shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                >
                  <div className="bg-primary/20 text-primary rounded-md p-2 border border-border flex-shrink-0">
                    <BookOpen className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm line-clamp-1">{note.title}</p>
                    <p className="text-xs text-muted-foreground">{note.subject}</p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground font-mono flex-shrink-0">
                    <Heart className="h-3 w-3" />
                    <span>{note.likes}</span>
                  </div>
                </div>
              </Link>
            )))}
          </section>

          {/* Recent Activity */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg flex items-center gap-2">
                <Activity className="h-4 w-4 text-accent" /> Activity
              </h2>
            </div>
            {activityLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-14 w-full rounded-lg" />)}
              </div>
            ) : (
              <div className="space-y-2">
                {activity?.slice(0, 8).map((item) => (
                  <div
                    key={item.id}
                    data-testid={`activity-item-${item.id}`}
                    className="flex items-start gap-3 p-3 rounded-lg border border-border bg-card/60"
                  >
                    <div className="mt-0.5 p-1.5 rounded-full bg-muted border border-border flex-shrink-0">
                      <ActivityIcon type={item.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-foreground">{item.description}</p>
                      {item.noteTitle && (
                        <p className="text-xs text-muted-foreground italic line-clamp-1">"{item.noteTitle}"</p>
                      )}
                    </div>
                    <div className="flex items-center text-xs text-muted-foreground font-mono flex-shrink-0">
                      <Clock className="h-3 w-3 mr-1" />
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </div>
                  </div>
                ))}
                {(!activity || activity.length === 0) && (
                  <p className="text-muted-foreground text-sm text-center py-8">No activity yet. Upload your first note!</p>
                )}
              </div>
            )}
          </section>
        </div>

        {/* My Notes */}
        {myNotes.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">My Notes</h2>
              <Link href="/profile" className="text-xs text-muted-foreground hover:text-foreground underline underline-offset-2">
                View profile
              </Link>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
              {myNotesLoading
                ? [1, 2, 3].map((i) => <Skeleton key={i} className="h-48 rounded-xl" />)
                : myNotes.slice(0, 3).map((note) => <NoteCard key={note.id} note={note} />)}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
