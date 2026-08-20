import { Card, CardContent, CardFooter, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, Heart, Download, FileText, FileCode, Image as ImageIcon, FileArchive, Clock } from "lucide-react";
import { Link } from "wouter";
import { Note } from "@workspace/api-client-react";
import { formatDistanceToNow } from "date-fns";

function getFileIcon(type: string) {
  switch (type.toLowerCase()) {
    case 'pdf': return <FileText className="h-4 w-4" />;
    case 'markdown':
    case 'md': return <FileCode className="h-4 w-4" />;
    case 'image':
    case 'png':
    case 'jpg': return <ImageIcon className="h-4 w-4" />;
    default: return <FileArchive className="h-4 w-4" />;
  }
}

function getSubjectColor(subject: string) {
  const colors = [
    "bg-red-100 text-red-800 border-red-200 dark:bg-red-900/30 dark:text-red-300 dark:border-red-800",
    "bg-orange-100 text-orange-800 border-orange-200 dark:bg-orange-900/30 dark:text-orange-300 dark:border-orange-800",
    "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800",
    "bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-300 dark:border-green-800",
    "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800",
    "bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-900/30 dark:text-teal-300 dark:border-teal-800",
    "bg-cyan-100 text-cyan-800 border-cyan-200 dark:bg-cyan-900/30 dark:text-cyan-300 dark:border-cyan-800",
    "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800",
    "bg-indigo-100 text-indigo-800 border-indigo-200 dark:bg-indigo-900/30 dark:text-indigo-300 dark:border-indigo-800",
    "bg-violet-100 text-violet-800 border-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800",
    "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-900/30 dark:text-purple-300 dark:border-purple-800",
    "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200 dark:bg-fuchsia-900/30 dark:text-fuchsia-300 dark:border-fuchsia-800",
    "bg-pink-100 text-pink-800 border-pink-200 dark:bg-pink-900/30 dark:text-pink-300 dark:border-pink-800",
    "bg-rose-100 text-rose-800 border-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800"
  ];
  
  // Simple deterministic hash
  let hash = 0;
  for (let i = 0; i < subject.length; i++) {
    hash = subject.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

export function NoteCard({ note }: { note: Note }) {
  return (
    <Link href={`/notes/${note.id}`}>
      <Card className="h-full flex flex-col hover-elevate transition-all duration-200 cursor-pointer border-2 border-border shadow-sm hover:shadow-md hover:-translate-y-1 bg-card group overflow-hidden">
        <CardHeader className="p-4 pb-2 space-y-2">
          <div className="flex justify-between items-start">
            <Badge variant="outline" className={`font-mono text-xs ${getSubjectColor(note.subject)}`}>
              {note.subject}
            </Badge>
            <div className="flex items-center text-muted-foreground bg-muted px-2 py-1 rounded-md text-xs font-mono">
              {getFileIcon(note.fileType)}
              <span className="ml-1 uppercase">{note.fileType}</span>
            </div>
          </div>
          <h3 className="font-bold text-lg leading-tight line-clamp-2 group-hover:text-primary transition-colors">
            {note.title}
          </h3>
        </CardHeader>
        <CardContent className="p-4 pt-2 flex-1">
          <p className="text-muted-foreground text-sm line-clamp-3 mb-4">
            {note.excerpt || "No description provided."}
          </p>
          <div className="flex flex-wrap gap-1 mt-auto">
            {note.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-[10px] px-1.5 py-0">
                #{tag}
              </Badge>
            ))}
            {note.tags.length > 3 && (
              <Badge variant="secondary" className="text-[10px] px-1.5 py-0">
                +{note.tags.length - 3}
              </Badge>
            )}
          </div>
        </CardContent>
        <CardFooter className="p-4 pt-0 flex justify-between items-center border-t bg-muted/20 mt-auto">
          <div className="flex items-center gap-2">
            <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary/20 text-primary font-bold text-xs">
              {note.authorInitial || note.authorName.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium truncate max-w-[80px]" title={note.authorName}>
                {note.authorName}
              </span>
              <span className="text-[10px] text-muted-foreground flex items-center">
                <Clock className="w-2.5 h-2.5 mr-0.5" />
                {formatDistanceToNow(new Date(note.createdAt), { addSuffix: true })}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-muted-foreground text-xs font-mono">
            <div className="flex items-center gap-1">
              <Heart className={`h-3 w-3 ${note.isLiked ? 'fill-destructive text-destructive' : ''}`} />
              <span>{note.likes}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="h-3 w-3" />
              <span>{note.views}</span>
            </div>
          </div>
        </CardFooter>
      </Card>
    </Link>
  );
}
