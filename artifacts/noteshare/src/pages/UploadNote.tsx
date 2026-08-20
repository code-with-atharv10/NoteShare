import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useLocation } from "wouter";
import { useCreateNote, getListNotesQueryKey, getGetNotesStatsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Upload, X, Plus, BookOpen } from "lucide-react";

const SUBJECTS = [
  "Computer Science", "Mathematics", "Physics", "Chemistry", "Biology",
  "History", "Literature", "Economics", "Psychology", "Engineering", "Other",
];
const FILE_TYPES = ["notes", "pdf", "markdown", "slides", "code", "summary", "cheatsheet"];

const uploadSchema = z.object({
  title: z.string().min(1, "Title is required"),
  subject: z.string().min(1, "Subject is required"),
  content: z.string().min(10, "Content must be at least 10 characters"),
  fileType: z.string().min(1, "File type is required"),
});
type UploadForm = z.infer<typeof uploadSchema>;

export default function UploadNote() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState("");

  const createNoteMutation = useCreateNote({
    mutation: {
      onSuccess: (note) => {
        queryClient.invalidateQueries({ queryKey: getListNotesQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetNotesStatsQueryKey() });
        toast({ title: "Note uploaded!", description: "Your note has been published." });
        setLocation(`/notes/${note.id}`);
      },
      onError: (err: unknown) => {
        const msg = (err as { data?: { error?: string } })?.data?.error ?? "Upload failed";
        toast({ title: "Upload failed", description: msg, variant: "destructive" });
      },
    },
  });

  const form = useForm<UploadForm>({
    resolver: zodResolver(uploadSchema),
    defaultValues: { title: "", subject: "", content: "", fileType: "notes" },
  });

  const addTag = () => {
    const tag = tagInput.trim().toLowerCase().replace(/\s+/g, "-");
    if (tag && !tags.includes(tag) && tags.length < 8) {
      setTags([...tags, tag]);
      setTagInput("");
    }
  };

  const removeTag = (tag: string) => setTags(tags.filter((t) => t !== tag));

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      addTag();
    }
  };

  const onSubmit = (values: UploadForm) => {
    createNoteMutation.mutate({ data: { ...values, tags } });
  };

  return (
    <div className="flex-1 bg-background">
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="flex items-center gap-3 mb-8">
          <div className="bg-primary text-primary-foreground p-2.5 rounded-xl border-2 border-border shadow-[3px_3px_0px_0px_rgba(0,0,0,0.9)]">
            <BookOpen className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-3xl font-bold font-serif">Upload Notes</h1>
            <p className="text-muted-foreground text-sm">Share your knowledge with fellow students</p>
          </div>
        </div>

        <div className="bg-card border-2 border-border shadow-[6px_6px_0px_0px_rgba(0,0,0,0.9)] rounded-xl p-6 md:p-8">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-base">Title</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g. Data Structures Cheat Sheet"
                        className="border-2 border-border h-11"
                        data-testid="input-title"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Subject</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-border h-11" data-testid="select-subject">
                            <SelectValue placeholder="Choose subject" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {SUBJECTS.map((s) => (
                            <SelectItem key={s} value={s}>{s}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="fileType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-semibold">Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger className="border-2 border-border h-11" data-testid="select-filetype">
                            <SelectValue placeholder="File type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {FILE_TYPES.map((t) => (
                            <SelectItem key={t} value={t} className="capitalize">{t}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="content"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="font-semibold text-base">Content</FormLabel>
                    <FormDescription className="text-xs">
                      Write your notes here. Use plain text or markdown-style formatting.
                    </FormDescription>
                    <FormControl>
                      <Textarea
                        placeholder="# Introduction&#10;&#10;Start writing your notes here..."
                        className="border-2 border-border min-h-[280px] font-mono text-sm resize-y"
                        data-testid="textarea-content"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tags */}
              <div className="space-y-2">
                <label className="font-semibold text-sm">Tags <span className="text-muted-foreground font-normal">(up to 8)</span></label>
                <div className="flex gap-2">
                  <Input
                    value={tagInput}
                    onChange={(e) => setTagInput(e.target.value)}
                    onKeyDown={handleTagKeyDown}
                    placeholder="Type a tag and press Enter"
                    className="border-2 border-border h-10 flex-1"
                    data-testid="input-tag"
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={addTag}
                    className="h-10 border-2 border-border"
                    data-testid="button-add-tag"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                {tags.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {tags.map((tag) => (
                      <Badge key={tag} variant="secondary" className="font-mono text-xs gap-1 pl-2 pr-1">
                        #{tag}
                        <button
                          type="button"
                          onClick={() => removeTag(tag)}
                          className="hover:text-destructive transition-colors ml-0.5"
                          data-testid={`button-remove-tag-${tag}`}
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </Badge>
                    ))}
                  </div>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-12 font-bold text-base border-2 border-border shadow-[4px_4px_0px_0px_rgba(0,0,0,0.9)] hover:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.9)] hover:translate-y-[2px] transition-all"
                disabled={createNoteMutation.isPending}
                data-testid="button-submit"
              >
                {createNoteMutation.isPending ? "Publishing..." : (
                  <><Upload className="mr-2 h-5 w-5" /> Publish Note</>
                )}
              </Button>
            </form>
          </Form>
        </div>
      </div>
    </div>
  );
}
