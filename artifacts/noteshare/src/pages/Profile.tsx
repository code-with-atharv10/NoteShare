import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  useGetMe,
  useUpdateMe,
  useGetUserNotes,
  useDeleteNote,
  getGetMeQueryKey,
  getGetUserNotesQueryKey,
  getListNotesQueryKey,
  getGetNotesStatsQueryKey,
} from "@workspace/api-client-react";
import { useAuth } from "@/hooks/use-auth";
import { NoteCard } from "@/components/NoteCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { User, FileText, Heart, BookOpen, Pencil, Check, X, GraduationCap } from "lucide-react";

const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().optional(),
  university: z.string().optional(),
});
type ProfileForm = z.infer<typeof profileSchema>;

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);

  const { data: me, isLoading: meLoading } = useGetMe({
    query: { queryKey: getGetMeQueryKey() },
  });

  const { data: myNotes, isLoading: notesLoading } = useGetUserNotes(user?.id ?? 0, {
    query: {
      enabled: !!user?.id,
      queryKey: getGetUserNotesQueryKey(user?.id ?? 0),
    },
  });

  const updateMeMutation = useUpdateMe({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetMeQueryKey() });
        setEditing(false);
        toast({ title: "Profile updated" });
      },
      onError: () => {
        toast({ title: "Update failed", variant: "destructive" });
      },
    },
  });

  const deleteNoteMutation = useDeleteNote({
    mutation: {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetUserNotesQueryKey(user?.id ?? 0) });
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetNotesStatsQueryKey() });
        toast({ title: "Note deleted" });
      },
    },
  });

  const form = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    values: {
      name: me?.name ?? "",
      bio: me?.bio ?? "",
      university: me?.university ?? "",
    },
  });

  const onSubmit = (values: ProfileForm) => {
    updateMeMutation.mutate({ data: values });
  };

  if (meLoading) {
    return (
      <div className="flex-1 bg-background">
        <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-20 w-20 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-8 w-48" />
              <Skeleton className="h-4 w-32" />
            </div>
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    );
  }

  const initial = me?.name?.charAt(0).toUpperCase() ?? "?";

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-8 max-w-5xl space-y-6">
        {/* Profile Header */}
        <div className="bg-card border-2 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] rounded-xl p-6">
          <div className="flex flex-col sm:flex-row sm:items-start gap-6">
            {/* Avatar */}
            <div className="w-20 h-20 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center text-3xl font-bold border-2 border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)] flex-shrink-0">
              {initial}
            </div>

            <div className="flex-1 min-w-0">
              {editing ? (
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="grid sm:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">Name</FormLabel>
                            <FormControl>
                              <Input className="border-2 border-border h-10" data-testid="input-name" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="university"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="font-semibold">University</FormLabel>
                            <FormControl>
                              <Input placeholder="Your university" className="border-2 border-border h-10" data-testid="input-university" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="font-semibold">Bio</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Tell others about yourself..."
                              className="border-2 border-border resize-none"
                              rows={3}
                              data-testid="textarea-bio"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <div className="flex gap-2">
                      <Button
                        type="submit"
                        size="sm"
                        className="border-2 border-border shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)]"
                        disabled={updateMeMutation.isPending}
                        data-testid="button-save"
                      >
                        <Check className="mr-1.5 h-4 w-4" />
                        {updateMeMutation.isPending ? "Saving..." : "Save"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="border-2 border-border"
                        onClick={() => setEditing(false)}
                        data-testid="button-cancel"
                      >
                        <X className="mr-1.5 h-4 w-4" /> Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              ) : (
                <div>
                  <div className="flex items-start justify-between gap-4 mb-2">
                    <div>
                      <h1 className="text-2xl font-bold font-serif">{me?.name}</h1>
                      {me?.university && (
                        <p className="text-sm text-muted-foreground flex items-center gap-1.5 mt-1">
                          <GraduationCap className="h-4 w-4" />
                          {me.university}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditing(true)}
                      className="border-2 border-border flex-shrink-0"
                      data-testid="button-edit-profile"
                    >
                      <Pencil className="mr-1.5 h-3.5 w-3.5" /> Edit
                    </Button>
                  </div>
                  {me?.bio && (
                    <p className="text-muted-foreground text-sm mt-2 leading-relaxed">{me.bio}</p>
                  )}
                  <p className="text-xs text-muted-foreground mt-2 font-mono">{me?.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-border">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold font-mono">
                <FileText className="h-5 w-5 text-primary" />
                {me?.notesCount ?? 0}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Notes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold font-mono">
                <Heart className="h-5 w-5 text-accent" />
                {me?.likesReceived ?? 0}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Likes</p>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1.5 text-2xl font-bold font-mono">
                <User className="h-5 w-5 text-secondary-foreground" />
                {me?.role ?? "student"}
              </div>
              <p className="text-xs text-muted-foreground uppercase tracking-wider mt-1">Role</p>
            </div>
          </div>
        </div>

        {/* Notes Tabs */}
        <Tabs defaultValue="my-notes">
          <TabsList className="border-2 border-border bg-muted">
            <TabsTrigger value="my-notes" className="data-[state=active]:bg-card data-[state=active]:border data-[state=active]:border-border">
              <BookOpen className="h-4 w-4 mr-2" /> My Notes ({myNotes?.length ?? 0})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="my-notes" className="mt-4">
            {notesLoading ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {[1, 2, 3].map((i) => <Skeleton key={i} className="h-56 rounded-xl" />)}
              </div>
            ) : myNotes && myNotes.length > 0 ? (
              <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-5">
                {myNotes.map((note) => (
                  <NoteCard key={note.id} note={note} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-card border-2 border-border rounded-xl">
                <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mx-auto mb-4 border-2 border-border">
                  <BookOpen className="h-7 w-7 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-lg mb-1">No notes yet</h3>
                <p className="text-muted-foreground text-sm mb-4">Start sharing your knowledge!</p>
                <Button asChild className="border-2 border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]">
                  <a href="/notes/upload">Upload your first note</a>
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
