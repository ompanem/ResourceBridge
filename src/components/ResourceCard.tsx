import { Bookmark, BookmarkCheck, ExternalLink, Copy, Check } from "lucide-react";
import { useState } from "react";
import type { Resource } from "@/types/resources";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ResourceCardProps {
  resource: Resource;
  isSaved: boolean;
  onToggleSave: () => void;
}

export function ResourceCard({ resource, isSaved, onToggleSave }: ResourceCardProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const text = `${resource.name}\n${resource.description}\n${resource.link}`;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    toast.success("Copied to clipboard");
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5 space-y-3 animate-fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1 min-w-0">
          <h3 className="font-heading font-semibold text-foreground text-base leading-tight">{resource.name}</h3>
          <Badge variant="secondary" className="text-xs font-heading">{resource.category}</Badge>
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <Button variant="ghost" size="icon" className="size-8" onClick={handleCopy} aria-label="Copy resource">
            {copied ? <Check className="size-3.5 text-primary" /> : <Copy className="size-3.5" />}
          </Button>
          <Button variant="ghost" size="icon" className="size-8" onClick={onToggleSave} aria-label={isSaved ? "Remove bookmark" : "Save resource"}>
            {isSaved ? <BookmarkCheck className="size-4 text-primary" /> : <Bookmark className="size-4" />}
          </Button>
        </div>
      </div>

      <p className="font-body text-sm text-foreground leading-relaxed">{resource.description}</p>

      <div className="space-y-1.5 text-sm">
        <p className="text-muted-foreground">
          <span className="font-heading font-medium text-foreground">Why this helps: </span>
          {resource.whyThisHelps}
        </p>
        <p className="text-muted-foreground">
          <span className="font-heading font-medium text-foreground">Location: </span>
          {resource.locationRelevance}
        </p>
      </div>

      <a
        href={resource.link}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex items-center gap-1.5 text-sm font-heading font-medium text-primary hover:text-primary/80 transition-colors"
      >
        Visit website <ExternalLink className="size-3.5" />
      </a>
    </div>
  );
}
