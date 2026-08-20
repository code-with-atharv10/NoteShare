import { useState } from "react";
import { useListNotes, getListNotesQueryKey } from "@workspace/api-client-react";
import { NoteCard } from "@/components/NoteCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useLocation } from "wouter";
import { useEffect } from "react";

const SUBJECTS = [
  "All Subjects",
  "Computer Science",
  "Mathematics",
  "Physics",
  "Chemistry",
  "Biology",
  "History",
  "Literature",
  "Economics",
  "Psychology",
  "Engineering",
];

export default function Notes() {
  const [location] = useLocation();
  const params = new URLSearchParams(location.includes("?") ? location.split("?")[1] : "");

  const [search, setSearch] = useState(params.get("search") ?? "");
  const [subject, setSubject] = useState(params.get("subject") ?? "");
  const [sort, setSort] = useState<"newest" | "popular" | "viewed">(
    (params.get("sort") as "popular") ?? "newest"
  );
  const [activeSearch, setActiveSearch] = useState(params.get("search") ?? "");
  const [activeSubject, setActiveSubject] = useState(params.get("subject") ?? "");

  const queryParams = {
    ...(activeSearch ? { search: activeSearch } : {}),
    ...(activeSubject && activeSubject !== "all" ? { subject: activeSubject } : {}),
    sort,
  };

  const { data: notes, isLoading } = useListNotes(queryParams, {
    query: { queryKey: getListNotesQueryKey(queryParams) },
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveSearch(search);
  };

  const clearFilters = () => {
    setSearch("");
    setActiveSearch("");
    setSubject("");
    setActiveSubject("");
    setSort("newest");
  };

  const hasFilters = activeSearch || activeSubject;

  return (
    <div className="flex-1 bg-background">
      <div className="border-b-2 border-border bg-card">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          <h1 className="text-3xl font-bold font-serif mb-2">Browse Notes</h1>
          <p className="text-muted-foreground mb-6">Discover study materials from students across universities</p>

          <form onSubmit={handleSearch} className="flex gap-2 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search notes, subjects, tags..."
                className="pl-9 border-2 border-border h-11"
                data-testid="input-search"
              />
            </div>
            <Button
              type="submit"
              className="border-2 border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[1px_1px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-[1px] transition-all font-bold h-11"
              data-testid="button-search"
            >
              Search
            </Button>
          </form>

          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <SlidersHorizontal className="h-3.5 w-3.5" />
              <span>Filter:</span>
            </div>
            <Select value={subject || "all"} onValueChange={(v) => { setSubject(v === "all" ? "" : v); setActiveSubject(v === "all" ? "" : v); }}>
              <SelectTrigger className="w-44 h-9 border-2 border-border text-sm" data-testid="select-subject">
                <SelectValue placeholder="Subject" />
              </SelectTrigger>
              <SelectContent>
                {SUBJECTS.map((s) => (
                  <SelectItem key={s} value={s === "All Subjects" ? "all" : s}>
                    {s}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={sort} onValueChange={(v) => setSort(v as "newest" | "popular" | "viewed")}>
              <SelectTrigger className="w-36 h-9 border-2 border-border text-sm" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Newest</SelectItem>
                <SelectItem value="popular">Most Liked</SelectItem>
                <SelectItem value="viewed">Most Viewed</SelectItem>
              </SelectContent>
            </Select>

            {hasFilters && (
              <Button
                variant="ghost"
                size="sm"
                className="h-9 text-muted-foreground hover:text-foreground"
                onClick={clearFilters}
                data-testid="button-clear-filters"
              >
                <X className="h-3.5 w-3.5 mr-1" /> Clear
              </Button>
            )}

            {notes && (
              <span className="text-sm text-muted-foreground font-mono ml-auto">
                {notes.length} note{notes.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-6xl">
        {isLoading ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-56 rounded-xl" />
            ))}
          </div>
        ) : notes && notes.length > 0 ? (
          <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
            {notes.map((note) => (
              <NoteCard key={note.id} note={note} />
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-border">
              <Search className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No notes found</h3>
            <p className="text-muted-foreground mb-6">
              {hasFilters ? "Try adjusting your filters or search terms." : "Be the first to upload a note!"}
            </p>
            {hasFilters && (
              <Button variant="outline" onClick={clearFilters} className="border-2 border-border">
                Clear filters
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
